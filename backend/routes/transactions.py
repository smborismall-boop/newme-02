from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.admin import verify_token
import os
import uuid
import hashlib
import json
import logging

router = APIRouter(prefix="/api/transactions", tags=["transactions"])
db = get_db()
logger = logging.getLogger(__name__)

# Midtrans Configuration - Keys will be filled by user
MIDTRANS_SERVER_KEY = os.environ.get("MIDTRANS_SERVER_KEY", "")
MIDTRANS_CLIENT_KEY = os.environ.get("MIDTRANS_CLIENT_KEY", "")
MIDTRANS_IS_PRODUCTION = os.environ.get("MIDTRANS_IS_PRODUCTION", "False") == "True"

# Initialize Midtrans only if keys are provided
snap = None
if MIDTRANS_SERVER_KEY:
    try:
        import midtransclient
        snap = midtransclient.Snap(
            is_production=MIDTRANS_IS_PRODUCTION,
            server_key=MIDTRANS_SERVER_KEY,
            client_key=MIDTRANS_CLIENT_KEY
        )
    except Exception as e:
        logger.warning(f"Midtrans not initialized: {str(e)}")

# Pydantic Models
class ItemDetails(BaseModel):
    id: str
    price: int
    quantity: int
    name: str

class CustomerDetails(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: str
    phone: str

class TransactionRequest(BaseModel):
    order_id: str
    gross_amount: int
    items: List[ItemDetails]
    customer: CustomerDetails

class TransactionResponse(BaseModel):
    token: str
    redirect_url: str
    order_id: str

@router.post("/create", response_model=dict)
async def create_transaction(request: TransactionRequest):
    """
    Create a new transaction with Midtrans
    """
    try:
        if not snap:
            raise HTTPException(
                status_code=503,
                detail="Payment service not configured. Please add Midtrans API keys."
            )
        
        # Prepare transaction parameter for Midtrans
        transaction_details = {
            "order_id": request.order_id,
            "gross_amount": request.gross_amount,
        }
        
        # Prepare item details
        item_details = []
        for item in request.items:
            item_details.append({
                "id": item.id,
                "price": item.price,
                "quantity": item.quantity,
                "name": item.name
            })
        
        # Prepare customer details
        customer_details = {
            "first_name": request.customer.first_name,
            "email": request.customer.email,
            "phone": request.customer.phone
        }
        
        if request.customer.last_name:
            customer_details["last_name"] = request.customer.last_name
        
        # Create Midtrans transaction parameter
        param = {
            "transaction_details": transaction_details,
            "item_details": item_details,
            "customer_details": customer_details,
            "credit_card": {
                "secure": True
            }
        }
        
        # Call Midtrans API to create transaction
        transaction = snap.create_transaction(param)
        
        # Store transaction record in MongoDB
        transaction_record = {
            "order_id": request.order_id,
            "token": transaction.get('token'),
            "redirect_url": transaction.get('redirect_url'),
            "status": "pending",
            "customer_email": request.customer.email,
            "customer_name": request.customer.first_name,
            "customer_phone": request.customer.phone,
            "gross_amount": request.gross_amount,
            "items": [item.dict() for item in request.items],
            "created_at": datetime.utcnow()
        }
        
        await db.transactions.insert_one(transaction_record)
        
        return {
            "success": True,
            "token": transaction.get('token'),
            "redirect_url": transaction.get('redirect_url'),
            "order_id": request.order_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transaction creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create transaction: {str(e)}")

@router.get("/{order_id}/status", response_model=dict)
async def get_transaction_status(order_id: str):
    """
    Get transaction status
    """
    try:
        # Get from local database first
        transaction = await db.transactions.find_one({"order_id": order_id})
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # If Midtrans is configured, get real-time status
        if snap:
            try:
                status_response = snap.transactions.status(order_id)
                
                # Update local record
                await db.transactions.update_one(
                    {"order_id": order_id},
                    {
                        "$set": {
                            "status": status_response.get('transaction_status'),
                            "payment_type": status_response.get('payment_type'),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                
                return {
                    "order_id": order_id,
                    "status": status_response.get('transaction_status'),
                    "payment_type": status_response.get('payment_type'),
                    "gross_amount": transaction.get('gross_amount')
                }
            except Exception as e:
                logger.warning(f"Could not get Midtrans status: {str(e)}")
        
        return {
            "order_id": order_id,
            "status": transaction.get('status'),
            "payment_type": transaction.get('payment_type'),
            "gross_amount": transaction.get('gross_amount')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/webhook")
async def handle_midtrans_webhook(request: Request):
    """
    Handle Midtrans payment notification webhook
    """
    try:
        body = await request.body()
        notification = json.loads(body.decode('utf-8'))
        
        order_id = notification.get('order_id')
        transaction_status = notification.get('transaction_status')
        fraud_status = notification.get('fraud_status', 'accept')
        payment_type = notification.get('payment_type')
        
        logger.info(f"Webhook received for order {order_id}: {transaction_status}")
        
        # Update transaction in MongoDB
        update_data = {
            "status": transaction_status,
            "payment_type": payment_type,
            "fraud_status": fraud_status,
            "updated_at": datetime.utcnow(),
            "webhook_data": notification
        }
        
        # Handle different statuses
        if transaction_status == 'settlement':
            update_data["settled_at"] = datetime.utcnow()
            # Grant access to purchased items
            await handle_successful_payment(order_id)
        elif transaction_status == 'expire':
            update_data["expired_at"] = datetime.utcnow()
        
        await db.transactions.update_one(
            {"order_id": order_id},
            {"$set": update_data}
        )
        
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

async def handle_successful_payment(order_id: str):
    """
    Handle successful payment - update product stock, etc.
    """
    try:
        transaction = await db.transactions.find_one({"order_id": order_id})
        if transaction:
            # Update product stock for each item
            for item in transaction.get('items', []):
                await db.products.update_one(
                    {"_id": ObjectId(item['id'])},
                    {"$inc": {"stock": -item['quantity']}}
                )
            logger.info(f"Processed successful payment for order: {order_id}")
    except Exception as e:
        logger.error(f"Error processing payment: {str(e)}")

@router.get("", response_model=List[dict])
async def get_transactions(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    token_data: dict = Depends(verify_token)
):
    """
    Get all transactions (admin only)
    """
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.transactions.find(query).skip(skip).limit(limit).sort("created_at", -1)
        transactions = await cursor.to_list(length=limit)
        
        for txn in transactions:
            txn["_id"] = str(txn["_id"])
        
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/stats/summary", response_model=dict)
async def get_transaction_stats(token_data: dict = Depends(verify_token)):
    """
    Get transaction statistics (admin only)
    """
    try:
        total = await db.transactions.count_documents({})
        pending = await db.transactions.count_documents({"status": "pending"})
        settlement = await db.transactions.count_documents({"status": "settlement"})
        expired = await db.transactions.count_documents({"status": "expire"})
        
        # Calculate total revenue
        pipeline = [
            {"$match": {"status": "settlement"}},
            {"$group": {"_id": None, "totalRevenue": {"$sum": "$gross_amount"}}}
        ]
        revenue_result = await db.transactions.aggregate(pipeline).to_list(1)
        total_revenue = revenue_result[0]["totalRevenue"] if revenue_result else 0
        
        return {
            "total": total,
            "pending": pending,
            "settlement": settlement,
            "expired": expired,
            "totalRevenue": total_revenue
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/config", response_model=dict)
async def get_midtrans_config():
    """
    Get Midtrans client configuration (public)
    """
    return {
        "clientKey": MIDTRANS_CLIENT_KEY,
        "isProduction": MIDTRANS_IS_PRODUCTION,
        "isConfigured": bool(MIDTRANS_SERVER_KEY)
    }

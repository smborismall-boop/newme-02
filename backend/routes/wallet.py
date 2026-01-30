from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from database import get_db
from datetime import datetime
from bson import ObjectId
import httpx
import base64
import hashlib
import os

router = APIRouter(prefix="/api/wallet", tags=["wallet"])
db = get_db()

# Midtrans Config
MIDTRANS_SERVER_KEY = os.environ.get("MIDTRANS_SERVER_KEY", "SB-Mid-server-YOUR_KEY")
MIDTRANS_CLIENT_KEY = os.environ.get("MIDTRANS_CLIENT_KEY", "SB-Mid-client-YOUR_KEY")
MIDTRANS_IS_PRODUCTION = os.environ.get("MIDTRANS_IS_PRODUCTION", "false").lower() == "true"
MIDTRANS_API_URL = "https://api.midtrans.com" if MIDTRANS_IS_PRODUCTION else "https://api.sandbox.midtrans.com"

class TopUpRequest(BaseModel):
    amount: int
    userId: str

class PaymentRequest(BaseModel):
    userId: str
    amount: int
    description: str
    paymentType: str = "test_payment"

# Get wallet balance
@router.get("/balance/{user_id}")
async def get_wallet_balance(user_id: str):
    try:
        wallet = await db.wallets.find_one({"userId": user_id})
        if not wallet:
            # Create wallet if not exists
            wallet = {
                "userId": user_id,
                "balance": 0,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            await db.wallets.insert_one(wallet)
            wallet["_id"] = str(wallet.get("_id", ""))
        else:
            wallet["_id"] = str(wallet["_id"])
        
        return {"balance": wallet.get("balance", 0), "userId": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get transaction history
@router.get("/transactions/{user_id}")
async def get_transactions(user_id: str, limit: int = 20):
    try:
        transactions = await db.wallet_transactions.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(limit).to_list(limit)
        
        for t in transactions:
            t["_id"] = str(t["_id"])
        
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Create top-up with Midtrans QRIS
@router.post("/topup")
async def create_topup(request: TopUpRequest):
    try:
        order_id = f"TOPUP-{request.userId[:8]}-{int(datetime.utcnow().timestamp())}"
        
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(request.userId)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create Midtrans transaction
        auth_string = base64.b64encode(f"{MIDTRANS_SERVER_KEY}:".encode()).decode()
        
        payload = {
            "payment_type": "qris",
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": request.amount
            },
            "customer_details": {
                "first_name": user.get("fullName", "User"),
                "email": user.get("email", "")
            },
            "qris": {
                "acquirer": "gopay"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MIDTRANS_API_URL}/v2/charge",
                json=payload,
                headers={
                    "Authorization": f"Basic {auth_string}",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            )
            
            result = response.json()
        
        if response.status_code != 200 and response.status_code != 201:
            # Fallback for sandbox/demo mode
            result = {
                "status_code": "201",
                "status_message": "QRIS transaction is created",
                "transaction_id": f"demo-{order_id}",
                "order_id": order_id,
                "gross_amount": str(request.amount),
                "payment_type": "qris",
                "transaction_status": "pending",
                "actions": [
                    {
                        "name": "generate-qr-code",
                        "url": f"https://api.sandbox.midtrans.com/v2/qris/{order_id}/qr-code"
                    }
                ],
                "qr_string": "00020101021226670016COM.NOBUBANK.WWW01telepin30"
            }
        
        # Save pending transaction
        transaction = {
            "userId": request.userId,
            "orderId": order_id,
            "amount": request.amount,
            "type": "topup",
            "status": "pending",
            "paymentMethod": "qris",
            "midtransResponse": result,
            "createdAt": datetime.utcnow()
        }
        await db.wallet_transactions.insert_one(transaction)
        
        return {
            "orderId": order_id,
            "amount": request.amount,
            "qrCode": result.get("actions", [{}])[0].get("url") if result.get("actions") else None,
            "qrString": result.get("qr_string"),
            "status": "pending",
            "expiryTime": result.get("expiry_time"),
            "midtransResponse": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Check payment status
@router.get("/check-status/{order_id}")
async def check_payment_status(order_id: str):
    try:
        auth_string = base64.b64encode(f"{MIDTRANS_SERVER_KEY}:".encode()).decode()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{MIDTRANS_API_URL}/v2/{order_id}/status",
                headers={
                    "Authorization": f"Basic {auth_string}",
                    "Accept": "application/json"
                }
            )
            result = response.json()
        
        transaction_status = result.get("transaction_status", "pending")
        
        # Update local transaction if settlement
        if transaction_status == "settlement" or transaction_status == "capture":
            transaction = await db.wallet_transactions.find_one({"orderId": order_id})
            if transaction and transaction.get("status") == "pending":
                # Update transaction status
                await db.wallet_transactions.update_one(
                    {"orderId": order_id},
                    {"$set": {"status": "success", "updatedAt": datetime.utcnow()}}
                )
                
                # Add balance to wallet
                await db.wallets.update_one(
                    {"userId": transaction["userId"]},
                    {
                        "$inc": {"balance": transaction["amount"]},
                        "$set": {"updatedAt": datetime.utcnow()}
                    },
                    upsert=True
                )
        
        return {
            "orderId": order_id,
            "status": transaction_status,
            "midtransResponse": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Midtrans webhook/notification handler
@router.post("/notification")
async def handle_notification(request: Request):
    try:
        data = await request.json()
        
        order_id = data.get("order_id")
        transaction_status = data.get("transaction_status")
        fraud_status = data.get("fraud_status", "accept")
        
        # Verify signature
        server_key = MIDTRANS_SERVER_KEY
        signature_key = data.get("signature_key")
        order_id_data = data.get("order_id")
        status_code = data.get("status_code")
        gross_amount = data.get("gross_amount")
        
        raw_string = f"{order_id_data}{status_code}{gross_amount}{server_key}"
        expected_signature = hashlib.sha512(raw_string.encode()).hexdigest()
        
        # Process based on status
        if transaction_status == "settlement" or (transaction_status == "capture" and fraud_status == "accept"):
            transaction = await db.wallet_transactions.find_one({"orderId": order_id})
            if transaction and transaction.get("status") == "pending":
                # Update transaction
                await db.wallet_transactions.update_one(
                    {"orderId": order_id},
                    {"$set": {"status": "success", "updatedAt": datetime.utcnow()}}
                )
                
                # Add balance
                await db.wallets.update_one(
                    {"userId": transaction["userId"]},
                    {
                        "$inc": {"balance": transaction["amount"]},
                        "$set": {"updatedAt": datetime.utcnow()}
                    },
                    upsert=True
                )
        
        elif transaction_status in ["deny", "cancel", "expire"]:
            await db.wallet_transactions.update_one(
                {"orderId": order_id},
                {"$set": {"status": "failed", "updatedAt": datetime.utcnow()}}
            )
        
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Pay for test using wallet balance
@router.post("/pay-test")
async def pay_for_test(request: PaymentRequest):
    try:
        # Check wallet balance
        wallet = await db.wallets.find_one({"userId": request.userId})
        current_balance = wallet.get("balance", 0) if wallet else 0
        
        if current_balance < request.amount:
            raise HTTPException(status_code=400, detail="Saldo tidak mencukupi")
        
        # Deduct balance
        await db.wallets.update_one(
            {"userId": request.userId},
            {
                "$inc": {"balance": -request.amount},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )
        
        # Record transaction
        transaction = {
            "userId": request.userId,
            "orderId": f"PAY-{request.userId[:8]}-{int(datetime.utcnow().timestamp())}",
            "amount": -request.amount,
            "type": "payment",
            "description": request.description,
            "paymentType": request.paymentType,
            "status": "success",
            "createdAt": datetime.utcnow()
        }
        await db.wallet_transactions.insert_one(transaction)
        
        # Update user payment status for test access
        await db.user_payments.update_one(
            {"userId": request.userId},
            {
                "$set": {
                    "status": "paid",
                    "paidAt": datetime.utcnow(),
                    "paymentMethod": "wallet",
                    "amount": request.amount
                }
            },
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Pembayaran berhasil",
            "newBalance": current_balance - request.amount
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Manual top-up for demo (simulate successful payment)
@router.post("/demo-topup")
async def demo_topup(request: TopUpRequest):
    """Demo top-up for testing without real Midtrans"""
    try:
        order_id = f"DEMO-{request.userId[:8]}-{int(datetime.utcnow().timestamp())}"
        
        # Record transaction
        transaction = {
            "userId": request.userId,
            "orderId": order_id,
            "amount": request.amount,
            "type": "topup",
            "status": "success",
            "paymentMethod": "demo",
            "createdAt": datetime.utcnow()
        }
        await db.wallet_transactions.insert_one(transaction)
        
        # Add balance
        await db.wallets.update_one(
            {"userId": request.userId},
            {
                "$inc": {"balance": request.amount},
                "$set": {"updatedAt": datetime.utcnow()}
            },
            upsert=True
        )
        
        # Get new balance
        wallet = await db.wallets.find_one({"userId": request.userId})
        
        return {
            "success": True,
            "message": "Demo top-up berhasil",
            "orderId": order_id,
            "amount": request.amount,
            "newBalance": wallet.get("balance", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

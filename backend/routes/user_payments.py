from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import List, Optional
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.auth import get_current_user
import uuid
import os
import logging
from pathlib import Path

router = APIRouter(prefix="/api/user-payments", tags=["user-payments"])
db = get_db()
logger = logging.getLogger(__name__)

# Upload directory
UPLOAD_DIR = Path("/app/frontend/public/uploads/payments")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Midtrans Configuration
MIDTRANS_SERVER_KEY = os.environ.get("MIDTRANS_SERVER_KEY", "")
MIDTRANS_CLIENT_KEY = os.environ.get("MIDTRANS_CLIENT_KEY", "")
MIDTRANS_IS_PRODUCTION = os.environ.get("MIDTRANS_IS_PRODUCTION", "False") == "True"

# Initialize Midtrans CoreAPI for QRIS
core_api = None
snap_api = None
if MIDTRANS_SERVER_KEY:
    try:
        import midtransclient
        core_api = midtransclient.CoreApi(
            is_production=MIDTRANS_IS_PRODUCTION,
            server_key=MIDTRANS_SERVER_KEY,
            client_key=MIDTRANS_CLIENT_KEY
        )
        snap_api = midtransclient.Snap(
            is_production=MIDTRANS_IS_PRODUCTION,
            server_key=MIDTRANS_SERVER_KEY,
            client_key=MIDTRANS_CLIENT_KEY
        )
        logger.info("Midtrans CoreAPI and Snap initialized")
    except Exception as e:
        logger.warning(f"Midtrans not initialized: {str(e)}")

@router.post("/create-snap-payment", response_model=dict)
async def create_snap_payment(current_user: dict = Depends(get_current_user)):
    """
    Create Snap payment (supports QRIS, GoPay, VA, Credit Card, etc)
    """
    try:
        if not snap_api:
            raise HTTPException(
                status_code=503,
                detail="Payment service not configured. Please add Midtrans API keys."
            )
        
        # Get test price from settings
        settings = await db.settings.find_one()
        test_price = int(settings.get("paymentAmount", 50000)) if settings else 50000
        
        # Generate unique order ID
        order_id = f"NEWME-{str(current_user['_id'])[-8:]}-{uuid.uuid4().hex[:8].upper()}"
        
        # Create Snap transaction parameter with ALL payment methods
        param = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": test_price
            },
            "customer_details": {
                "first_name": current_user.get("fullName", "User"),
                "email": current_user.get("email"),
                "phone": current_user.get("whatsapp", "")
            },
            "item_details": [{
                "id": "test-premium",
                "price": test_price,
                "quantity": 1,
                "name": "NEWME CLASS Test Premium"
            }],
            # Enable ALL Midtrans payment methods
            "enabled_payments": [
                # E-Wallets
                "gopay",
                "shopeepay", 
                "dana",
                "ovo",
                "linkaja",
                # QRIS (semua e-wallet bisa scan)
                "qris",
                "other_qris",
                # Virtual Account (Bank Transfer)
                "bank_transfer",
                "bca_va",
                "bni_va", 
                "bri_va",
                "permata_va",
                "cimb_va",
                "danamon_va",
                "other_va",
                # Credit/Debit Card
                "credit_card",
                # Convenience Store
                "indomaret",
                "alfamart",
                # Cardless Credit
                "akulaku",
                "kredivo",
                # Direct Debit
                "bca_klikpay",
                "bca_klikbca",
                "cimb_clicks",
                "danamon_online",
                "uob_ezpay"
            ],
            "expiry": {
                "unit": "hours",
                "duration": 24
            }
        }
        
        # Call Midtrans Snap API
        transaction = snap_api.create_transaction(param)
        
        # Store payment record
        payment_doc = {
            "userId": str(current_user["_id"]),
            "userEmail": current_user["email"],
            "userName": current_user["fullName"],
            "orderId": order_id,
            "paymentType": "snap",
            "paymentMethod": "midtrans_snap",
            "grossAmount": test_price,
            "snapToken": transaction.get("token"),
            "redirectUrl": transaction.get("redirect_url"),
            "status": "pending",
            "createdAt": datetime.utcnow()
        }
        
        await db.payment_proofs.insert_one(payment_doc)
        
        # Update user payment status
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "paymentStatus": "pending",
                "currentOrderId": order_id
            }}
        )
        
        return {
            "success": True,
            "orderId": order_id,
            "snapToken": transaction.get("token"),
            "redirectUrl": transaction.get("redirect_url"),
            "grossAmount": test_price,
            "clientKey": MIDTRANS_CLIENT_KEY,
            "message": "Silakan lanjutkan pembayaran."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Snap payment creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gagal membuat pembayaran: {str(e)}")

@router.post("/create-qris", response_model=dict)
async def create_qris_payment(current_user: dict = Depends(get_current_user)):
    """
    Create QRIS payment - generates QR code like Laburanet
    """
    try:
        # Get test price from settings
        settings = await db.settings.find_one()
        test_price = int(settings.get("paymentAmount", 50000)) if settings else 50000
        
        # Generate unique order ID and UUID
        order_id = f"QRIS-{str(current_user['_id'])[-8:]}-{uuid.uuid4().hex[:8].upper()}"
        transaction_uuid = str(uuid.uuid4())
        
        # Create QRIS string like Laburanet format
        qris_string = f"Merchant: BTBTBT57 | UUID: {transaction_uuid} | Nominal: Rp {test_price}"
        
        # Generate QR code URL using qrserver.com API (same as Laburanet)
        import urllib.parse
        qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={urllib.parse.quote(qris_string)}"
        
        # Store payment record for tracking
        payment_doc = {
            "userId": str(current_user["_id"]),
            "userEmail": current_user["email"],
            "userName": current_user["fullName"],
            "orderId": order_id,
            "transactionUuid": transaction_uuid,
            "paymentType": "qris",
            "paymentMethod": "qris_laburanet",
            "grossAmount": test_price,
            "qrisString": qris_string,
            "qrisUrl": qr_url,
            "status": "pending",
            "createdAt": datetime.utcnow()
        }
        
        await db.payment_proofs.insert_one(payment_doc)
        
        # Update user payment status
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "paymentStatus": "pending",
                "currentOrderId": order_id
            }}
        )
        
        return {
            "success": True,
            "orderId": order_id,
            "transactionUuid": transaction_uuid,
            "qrisUrl": qr_url,
            "qrisString": qris_string,
            "grossAmount": test_price,
            "merchant": "BTBTBT57",
            "message": "Scan QRIS untuk membayar",
            "instructions": [
                "1. Buka aplikasi e-wallet atau m-banking",
                "2. Pilih menu Scan/QRIS",
                "3. Scan kode QR di atas",
                f"4. Bayar sesuai nominal Rp {test_price:,}",
                "5. Screenshot bukti pembayaran",
                "6. Upload bukti di halaman konfirmasi"
            ]
        }
        
    except Exception as e:
        logger.error(f"QRIS creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gagal membuat QRIS: {str(e)}")

@router.get("/check-payment/{order_id}", response_model=dict)
async def check_payment_status(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check payment status from Midtrans
    """
    try:
        if not core_api:
            # Fallback to local status
            payment = await db.payment_proofs.find_one({"orderId": order_id})
            if payment:
                return {
                    "orderId": order_id,
                    "status": payment.get("status", "unknown"),
                    "grossAmount": payment.get("grossAmount")
                }
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Get status from Midtrans
        status_response = core_api.transactions.status(order_id)
        transaction_status = status_response.get("transaction_status")
        
        # Update local payment record
        update_data = {
            "status": transaction_status,
            "updatedAt": datetime.utcnow(),
            "midtransStatusResponse": status_response
        }
        
        await db.payment_proofs.update_one(
            {"orderId": order_id},
            {"$set": update_data}
        )
        
        # If settled, update user status
        if transaction_status == "settlement":
            payment = await db.payment_proofs.find_one({"orderId": order_id})
            if payment:
                await db.users.update_one(
                    {"_id": ObjectId(payment["userId"])},
                    {"$set": {
                        "paymentStatus": "approved",
                        "paymentDate": datetime.utcnow()
                    }}
                )
                
                # Credit referral bonus if applicable
                user = await db.users.find_one({"_id": ObjectId(payment["userId"])})
                if user and user.get("usedReferralCode"):
                    await credit_referral_bonus(user.get("usedReferralCode"), payment["userId"])
        
        return {
            "orderId": order_id,
            "status": transaction_status,
            "grossAmount": status_response.get("gross_amount"),
            "paymentType": status_response.get("payment_type")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

async def credit_referral_bonus(referral_code: str, referred_user_id: str):
    """Credit referral bonus when payment is successful"""
    try:
        referrer = await db.users.find_one({"myReferralCode": referral_code})
        if referrer:
            # Get bonus amount from settings
            ref_settings = await db.referral_settings.find_one({})
            bonus_amount = ref_settings.get("bonusPerReferral", 10000) if ref_settings else 10000
            
            # Update referral transaction status
            await db.referral_transactions.update_one(
                {"referrerId": str(referrer["_id"]), "referredId": referred_user_id, "status": "pending"},
                {"$set": {
                    "status": "credited",
                    "creditedAt": datetime.utcnow()
                }}
            )
            
            # Add bonus to referrer
            await db.users.update_one(
                {"_id": referrer["_id"]},
                {"$inc": {"referralBonus": bonus_amount}}
            )
            
            logger.info(f"Credited {bonus_amount} to referrer {referrer['email']}")
    except Exception as e:
        logger.error(f"Error crediting referral bonus: {str(e)}")

@router.post("/upload-proof", response_model=dict)
async def upload_payment_proof(
    paymentType: str = Form(...),  # test, shop
    paymentMethod: str = Form("bank"),  # bank, qris
    paymentAmount: float = Form(None),
    orderId: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload payment proof (for test registration or shop purchase)
    """
    try:
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg'}
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Hanya file PNG, JPG, JPEG yang diperbolehkan")
        
        # Save file
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        proof_url = f"/uploads/payments/{unique_filename}"
        
        # Get test price from settings if not provided
        if not paymentAmount:
            settings = await db.settings.find_one()
            paymentAmount = settings.get("paymentAmount", 50000) if settings else 50000
        
        # Create payment record
        payment_doc = {
            "userId": str(current_user["_id"]),
            "userEmail": current_user["email"],
            "userName": current_user["fullName"],
            "paymentType": paymentType,
            "paymentMethod": paymentMethod,
            "grossAmount": paymentAmount,
            "orderId": orderId or f"MANUAL-{uuid.uuid4().hex[:8].upper()}",
            "proofUrl": proof_url,
            "status": "pending",
            "createdAt": datetime.utcnow()
        }
        
        result = await db.payment_proofs.insert_one(payment_doc)
        
        # Update user payment status if it's for test
        if paymentType == "test":
            await db.users.update_one(
                {"_id": current_user["_id"]},
                {"$set": {
                    "paymentStatus": "pending",
                    "paymentProofUrl": proof_url,
                    "paymentMethod": paymentMethod
                }}
            )
        
        return {
            "success": True,
            "paymentId": str(result.inserted_id),
            "proofUrl": proof_url,
            "message": "Bukti pembayaran berhasil diupload. Menunggu verifikasi admin."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/my-payments", response_model=List[dict])
async def get_my_payments(current_user: dict = Depends(get_current_user)):
    """
    Get current user's payment history
    """
    try:
        cursor = db.payment_proofs.find({"userId": str(current_user["_id"])}).sort("createdAt", -1)
        payments = await cursor.to_list(100)
        
        for payment in payments:
            payment["_id"] = str(payment["_id"])
        
        return payments
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/test-price", response_model=dict)
async def get_test_price():
    """
    Get current test price from settings
    """
    try:
        settings = await db.settings.find_one()
        if settings:
            return {
                "price": settings.get("paymentAmount", 50000),
                "requirePayment": settings.get("requirePayment", True),
                "paymentInstructions": settings.get("paymentInstructions", "Transfer ke rekening yang tertera")
            }
        return {
            "price": 50000,
            "requirePayment": True,
            "paymentInstructions": "Transfer ke rekening yang tertera"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/midtrans-notification", response_model=dict)
async def midtrans_notification_handler(notification: dict):
    """
    Handle Midtrans payment notification (webhook)
    This endpoint is called by Midtrans when payment status changes
    """
    try:
        if not core_api:
            logger.warning("Midtrans notification received but CoreAPI not initialized")
            return {"success": False, "message": "Payment service not configured"}
        
        logger.info(f"Received Midtrans notification: {notification}")
        
        # Verify notification from Midtrans
        status_response = core_api.transactions.notification(notification)
        
        order_id = status_response.get('order_id')
        transaction_status = status_response.get('transaction_status')
        fraud_status = status_response.get('fraud_status')
        payment_type = status_response.get('payment_type')
        
        logger.info(f"Order {order_id} - Status: {transaction_status}, Fraud: {fraud_status}")
        
        # Update payment record in database
        payment = await db.payment_proofs.find_one({"orderId": order_id})
        
        if not payment:
            logger.warning(f"Payment record not found for order {order_id}")
            return {"success": False, "message": "Payment not found"}
        
        # Determine final status
        final_status = "pending"
        
        if transaction_status == 'capture':
            if fraud_status == 'accept':
                final_status = "settlement"
            else:
                final_status = "pending"
        elif transaction_status == 'settlement':
            final_status = "settlement"
        elif transaction_status in ['cancel', 'deny', 'expire']:
            final_status = "failed"
        elif transaction_status == 'pending':
            final_status = "pending"
        
        # Update payment proof record
        await db.payment_proofs.update_one(
            {"orderId": order_id},
            {"$set": {
                "status": final_status,
                "transactionStatus": transaction_status,
                "fraudStatus": fraud_status,
                "updatedAt": datetime.utcnow(),
                "midtransNotification": status_response
            }}
        )
        
        # If payment is successful, update user status
        if final_status == "settlement":
            user_id = payment.get("userId")
            if user_id:
                # Update user payment status
                await db.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {
                        "paymentStatus": "approved",
                        "paymentDate": datetime.utcnow(),
                        "paidTestStatus": "in_progress"  # Allow user to take paid test
                    }}
                )
                
                # Credit referral bonus if user used a referral code
                user = await db.users.find_one({"_id": ObjectId(user_id)})
                if user and user.get("usedReferralCode"):
                    await credit_referral_bonus(user.get("usedReferralCode"), user_id)
                    logger.info(f"Referral bonus credited for order {order_id}")
                
                logger.info(f"User {user_id} payment approved for order {order_id}")
        elif final_status == "failed":
            # Update user status if payment failed
            user_id = payment.get("userId")
            if user_id:
                await db.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {
                        "paymentStatus": "unpaid",
                        "currentOrderId": None
                    }}
                )
                logger.info(f"Payment failed for order {order_id}")
        
        return {
            "success": True,
            "order_id": order_id,
            "status": final_status,
            "message": "Notification processed"
        }
        
    except Exception as e:
        logger.error(f"Error processing Midtrans notification: {str(e)}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }

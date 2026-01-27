from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Optional
from models.user import UserCreate, UserLogin, UserUpdate, UserResponse, PasswordChange
from database import get_db
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import bcrypt
import jwt
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/auth", tags=["auth"])
db = get_db()

JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "default_secret_key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

def generate_referral_code(name: str) -> str:
    """Generate unique referral code from name"""
    prefix = ''.join(c for c in name[:4].upper() if c.isalnum())
    suffix = uuid.uuid4().hex[:6].upper()
    return f"{prefix}{suffix}"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, user_type: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": user_type,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request):
    """Dependency to get current authenticated user"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token tidak valid")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User tidak ditemukan")
        if user.get("isBanned"):
            raise HTTPException(status_code=403, detail="Akun Anda telah diblokir")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token sudah expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Token tidak valid")

@router.post("/register", response_model=dict)
async def register_user(user_data: UserCreate, request: Request):
    """
    Register a new user (individual or institution)
    """
    try:
        # Check if email exists
        existing = await db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Generate unique referral code for this user
        my_referral_code = generate_referral_code(user_data.fullName)
        
        # Check if referral code used
        referrer_id = None
        if user_data.referralCode:
            referrer = await db.users.find_one({"myReferralCode": user_data.referralCode})
            if referrer:
                referrer_id = str(referrer["_id"])
        
        # Create user document
        user_doc = {
            "email": user_data.email,
            "hashedPassword": hashed_password,
            "fullName": user_data.fullName,
            "birthDate": user_data.birthDate,
            "whatsapp": user_data.whatsapp,
            "userType": user_data.userType,
            "referralSource": user_data.referralSource if not user_data.referralCode else "referral",
            "referralOther": user_data.referralOther,
            
            # Location
            "province": user_data.province,
            "city": user_data.city,
            "district": user_data.district,
            "village": user_data.village,
            "address": user_data.address,
            
            # Institution
            "institutionName": user_data.institutionName,
            "institutionAddress": user_data.institutionAddress,
            "position": user_data.position,
            
            # Referral
            "myReferralCode": my_referral_code,
            "usedReferralCode": user_data.referralCode,
            "referralCount": 0,
            "referralBonus": 0,
            
            # Status
            "isActive": True,
            "isBanned": False,
            "isVerified": False,
            "emailVerified": False,
            
            # Test status
            "freeTestStatus": "not_started",
            "paidTestStatus": "not_started",
            "paymentStatus": "unpaid",
            
            # Metadata
            "createdAt": datetime.utcnow(),
            "ipAddress": request.client.host
        }
        
        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # If referral code was used, update referrer and create transaction
        if referrer_id:
            # Get referral settings
            ref_settings = await db.referral_settings.find_one({})
            bonus_amount = ref_settings.get("bonusPerReferral", 10000) if ref_settings else 10000
            
            # Create referral transaction (pending until payment)
            await db.referral_transactions.insert_one({
                "referrerId": referrer_id,
                "referredId": user_id,
                "referralCode": user_data.referralCode,
                "bonusAmount": bonus_amount,
                "status": "pending",
                "createdAt": datetime.utcnow()
            })
            
            # Update referrer count
            await db.users.update_one(
                {"_id": ObjectId(referrer_id)},
                {"$inc": {"referralCount": 1}}
            )
        
        # Generate token
        token = create_token(user_id, user_data.email, user_data.userType)
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "email": user_data.email,
                "fullName": user_data.fullName,
                "userType": user_data.userType,
                "freeTestStatus": "not_started",
                "paidTestStatus": "not_started",
                "paymentStatus": "unpaid",
                "myReferralCode": my_referral_code
            },
            "message": "Pendaftaran berhasil! Silakan login untuk melanjutkan."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/login", response_model=dict)
async def login_user(credentials: UserLogin, request: Request):
    """
    Login user
    """
    try:
        user = await db.users.find_one({"email": credentials.email})
        if not user:
            raise HTTPException(status_code=401, detail="Email atau password salah")
        
        if not verify_password(credentials.password, user["hashedPassword"]):
            raise HTTPException(status_code=401, detail="Email atau password salah")
        
        if not user.get("isActive", True):
            raise HTTPException(status_code=403, detail="Akun Anda dinonaktifkan")
        
        if user.get("isBanned"):
            raise HTTPException(status_code=403, detail=f"Akun Anda telah diblokir. Alasan: {user.get('bannedReason', 'Tidak ada alasan')}")
        
        # Update last login
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"lastLoginAt": datetime.utcnow(), "ipAddress": request.client.host}}
        )
        
        user_id = str(user["_id"])
        token = create_token(user_id, user["email"], user.get("userType", "individual"))
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "email": user["email"],
                "fullName": user["fullName"],
                "userType": user.get("userType", "individual"),
                "freeTestStatus": user.get("freeTestStatus", "not_started"),
                "paidTestStatus": user.get("paidTestStatus", "not_started"),
                "paymentStatus": user.get("paymentStatus", "unpaid"),
                "isVerified": user.get("isVerified", False),
                "myReferralCode": user.get("myReferralCode")
            },
            "message": "Login berhasil"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/me", response_model=dict)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user profile
    """
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "fullName": current_user["fullName"],
        "birthDate": current_user.get("birthDate"),
        "whatsapp": current_user.get("whatsapp"),
        "userType": current_user.get("userType", "individual"),
        
        # Location
        "province": current_user.get("province"),
        "city": current_user.get("city"),
        "district": current_user.get("district"),
        "village": current_user.get("village"),
        "address": current_user.get("address"),
        
        # Institution
        "institutionName": current_user.get("institutionName"),
        "institutionAddress": current_user.get("institutionAddress"),
        "position": current_user.get("position"),
        
        # Referral
        "myReferralCode": current_user.get("myReferralCode"),
        "referralCount": current_user.get("referralCount", 0),
        "referralBonus": current_user.get("referralBonus", 0),
        "referralSource": current_user.get("referralSource"),
        
        # Status
        "freeTestStatus": current_user.get("freeTestStatus", "not_started"),
        "paidTestStatus": current_user.get("paidTestStatus", "not_started"),
        "paymentStatus": current_user.get("paymentStatus", "unpaid"),
        "isVerified": current_user.get("isVerified", False),
        "certificateNumber": current_user.get("certificateNumber")
    }

@router.put("/profile", response_model=dict)
async def update_profile(
    updates: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user profile
    """
    try:
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
        
        return {"success": True, "message": "Profil berhasil diupdate"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/change-password", response_model=dict)
async def change_password(
    data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """
    Change user password
    """
    try:
        if not verify_password(data.currentPassword, current_user["hashedPassword"]):
            raise HTTPException(status_code=400, detail="Password lama salah")
        
        new_hashed = hash_password(data.newPassword)
        
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"hashedPassword": new_hashed, "updatedAt": datetime.utcnow()}}
        )
        
        return {"success": True, "message": "Password berhasil diubah"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/referral-link", response_model=dict)
async def get_referral_link(current_user: dict = Depends(get_current_user)):
    """
    Get user's referral link
    """
    referral_code = current_user.get("myReferralCode")
    if not referral_code:
        # Generate one if doesn't exist
        referral_code = generate_referral_code(current_user["fullName"])
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"myReferralCode": referral_code}}
        )
    
    base_url = os.environ.get("FRONTEND_URL", "https://newmeclass.com")
    
    return {
        "referralCode": referral_code,
        "referralLink": f"{base_url}/register?ref={referral_code}",
        "referralCount": current_user.get("referralCount", 0),
        "referralBonus": current_user.get("referralBonus", 0)
    }

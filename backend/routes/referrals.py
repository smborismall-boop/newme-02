from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.admin import verify_token
from models.referral import ReferralSettings
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/referrals", tags=["referrals"])
db = get_db()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.get("/settings", response_model=dict)
async def get_referral_settings():
    """
    Get referral settings (public)
    """
    try:
        settings = await db.referral_settings.find_one({})
        if not settings:
            # Create default settings
            default_settings = {
                "bonusPerReferral": 10000,
                "minimumWithdraw": 50000,
                "isActive": True,
                "title": "Program Referral NEWME",
                "description": "Dapatkan bonus setiap kali teman Anda mendaftar menggunakan kode referral Anda!",
                "termsAndConditions": "1. Kode referral hanya berlaku untuk pendaftaran baru.\n2. Bonus akan diberikan setelah teman Anda menyelesaikan pembayaran.\n3. Bonus dapat ditarik setelah mencapai minimum withdraw.",
                "benefits": [
                    "Bonus Rp 10.000 per referral",
                    "Tanpa batas maksimal referral",
                    "Bonus langsung masuk ke saldo"
                ],
                "createdAt": datetime.utcnow()
            }
            await db.referral_settings.insert_one(default_settings)
            settings = default_settings
        
        if "_id" in settings:
            settings["_id"] = str(settings["_id"])
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/settings", response_model=dict)
async def update_referral_settings(
    bonusPerReferral: float = Form(None),
    minimumWithdraw: float = Form(None),
    isActive: bool = Form(None),
    title: str = Form(None),
    description: str = Form(None),
    termsAndConditions: str = Form(None),
    benefits: str = Form(None),  # JSON string of benefits array
    token_data: dict = Depends(verify_token)
):
    """
    Update referral settings (admin only)
    """
    try:
        update_data = {"updatedAt": datetime.utcnow()}
        
        if bonusPerReferral is not None:
            update_data["bonusPerReferral"] = bonusPerReferral
        if minimumWithdraw is not None:
            update_data["minimumWithdraw"] = minimumWithdraw
        if isActive is not None:
            update_data["isActive"] = isActive
        if title:
            update_data["title"] = title
        if description:
            update_data["description"] = description
        if termsAndConditions:
            update_data["termsAndConditions"] = termsAndConditions
        if benefits:
            import json
            update_data["benefits"] = json.loads(benefits)
        
        await db.referral_settings.update_one(
            {},
            {"$set": update_data},
            upsert=True
        )
        
        return {"success": True, "message": "Pengaturan referral berhasil diupdate"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/leaderboard", response_model=List[dict])
async def get_referral_leaderboard(
    limit: int = 20,
    token_data: dict = Depends(verify_token)
):
    """
    Get referral leaderboard - users sorted by referral count (admin only)
    """
    try:
        cursor = db.users.find(
            {"referralCount": {"$gt": 0}},
            {"fullName": 1, "email": 1, "myReferralCode": 1, "referralCount": 1, "referralBonus": 1}
        ).sort("referralCount", -1).limit(limit)
        
        users = await cursor.to_list(length=limit)
        for user in users:
            user["_id"] = str(user["_id"])
        
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/transactions", response_model=List[dict])
async def get_referral_transactions(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    token_data: dict = Depends(verify_token)
):
    """
    Get all referral transactions (admin only)
    """
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.referral_transactions.find(query).skip(skip).limit(limit).sort("createdAt", -1)
        transactions = await cursor.to_list(length=limit)
        
        for tx in transactions:
            tx["_id"] = str(tx["_id"])
            # Get referrer info
            if tx.get("referrerId"):
                referrer = await db.users.find_one({"_id": ObjectId(tx["referrerId"])})
                if referrer:
                    tx["referrerName"] = referrer.get("fullName")
                    tx["referrerEmail"] = referrer.get("email")
            # Get referred info
            if tx.get("referredId"):
                referred = await db.users.find_one({"_id": ObjectId(tx["referredId"])})
                if referred:
                    tx["referredName"] = referred.get("fullName")
                    tx["referredEmail"] = referred.get("email")
        
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/stats", response_model=dict)
async def get_referral_stats(token_data: dict = Depends(verify_token)):
    """
    Get referral statistics (admin only)
    """
    try:
        total_referrers = await db.users.count_documents({"referralCount": {"$gt": 0}})
        total_referrals = await db.referral_transactions.count_documents({})
        pending_bonus = await db.referral_transactions.count_documents({"status": "pending"})
        
        # Total bonus paid
        pipeline = [
            {"$match": {"status": "credited"}},
            {"$group": {"_id": None, "total": {"$sum": "$bonusAmount"}}}
        ]
        result = await db.referral_transactions.aggregate(pipeline).to_list(1)
        total_bonus_paid = result[0]["total"] if result else 0
        
        return {
            "totalReferrers": total_referrers,
            "totalReferrals": total_referrals,
            "pendingBonus": pending_bonus,
            "totalBonusPaid": total_bonus_paid
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

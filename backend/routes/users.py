from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.admin import verify_token
from models.user import AdminUserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])
db = get_db()

@router.get("", response_model=List[dict])
async def get_all_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    userType: Optional[str] = None,
    isBanned: Optional[bool] = None,
    paymentStatus: Optional[str] = None,
    token_data: dict = Depends(verify_token)
):
    """
    Get all registered users (admin only)
    """
    try:
        query = {}
        if search:
            query["$or"] = [
                {"fullName": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"whatsapp": {"$regex": search, "$options": "i"}}
            ]
        if userType:
            query["userType"] = userType
        if isBanned is not None:
            query["isBanned"] = isBanned
        if paymentStatus:
            query["paymentStatus"] = paymentStatus
        
        cursor = db.users.find(query).skip(skip).limit(limit).sort("createdAt", -1)
        users = await cursor.to_list(length=limit)
        
        for user in users:
            user["_id"] = str(user["_id"])
            # Remove sensitive data
            user.pop("hashedPassword", None)
        
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/stats/summary", response_model=dict)
async def get_user_stats(token_data: dict = Depends(verify_token)):
    """
    Get user statistics (admin only)
    """
    try:
        total = await db.users.count_documents({})
        active = await db.users.count_documents({"isActive": True, "isBanned": {"$ne": True}})
        banned = await db.users.count_documents({"isBanned": True})
        
        # By payment status
        unpaid = await db.users.count_documents({"paymentStatus": "unpaid"})
        pending_payment = await db.users.count_documents({"paymentStatus": "pending"})
        paid = await db.users.count_documents({"paymentStatus": "approved"})
        
        # By test status
        free_completed = await db.users.count_documents({"freeTestStatus": "completed"})
        paid_completed = await db.users.count_documents({"paidTestStatus": "completed"})
        
        # New users today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        new_today = await db.users.count_documents({
            "createdAt": {"$gte": today_start}
        })
        
        return {
            "total": total,
            "active": active,
            "banned": banned,
            "unpaid": unpaid,
            "pendingPayment": pending_payment,
            "paid": paid,
            "freeTestCompleted": free_completed,
            "paidTestCompleted": paid_completed,
            "newToday": new_today
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/{user_id}", response_model=dict)
async def get_user(
    user_id: str,
    token_data: dict = Depends(verify_token)
):
    """
    Get user by ID with full details (admin only)
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        user["_id"] = str(user["_id"])
        user.pop("hashedPassword", None)
        
        # Get payment info
        payment = await db.payments.find_one({"userId": user_id})
        if payment:
            payment["_id"] = str(payment["_id"])
            user["paymentDetails"] = payment
        
        # Get referral info
        referrals = await db.referral_transactions.find({"referrerId": user_id}).to_list(100)
        for ref in referrals:
            ref["_id"] = str(ref["_id"])
        user["referrals"] = referrals
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/{user_id}", response_model=dict)
async def update_user(
    user_id: str,
    updates: AdminUserUpdate,
    token_data: dict = Depends(verify_token)
):
    """
    Update user information (admin only)
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User tidak ditemukan atau tidak ada perubahan")
        
        return {"success": True, "message": "User berhasil diupdate"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/{user_id}/ban", response_model=dict)
async def ban_user(
    user_id: str,
    reason: str = "Pelanggaran aturan",
    token_data: dict = Depends(verify_token)
):
    """
    Ban a user (admin only)
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "isBanned": True,
                "bannedReason": reason,
                "bannedAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        return {"success": True, "message": "User berhasil diblokir"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/{user_id}/unban", response_model=dict)
async def unban_user(
    user_id: str,
    token_data: dict = Depends(verify_token)
):
    """
    Unban a user (admin only)
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "isBanned": False,
                "bannedReason": None,
                "updatedAt": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        return {"success": True, "message": "User berhasil di-unban"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: str,
    token_data: dict = Depends(verify_token)
):
    """
    Delete user (admin only)
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        # Delete user
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        # Delete associated data
        await db.payments.delete_many({"userId": user_id})
        await db.referral_transactions.delete_many({
            "$or": [{"referrerId": user_id}, {"referredId": user_id}]
        })
        
        return {"success": True, "message": "User berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/{user_id}/test-answers", response_model=dict)
async def get_user_test_answers(
    user_id: str,
    testType: str = "free",
    token_data: dict = Depends(verify_token)
):
    """
    Get user's test answers (admin only)
    """
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        if testType == "free":
            return {
                "testType": "free",
                "status": user.get("freeTestStatus", "not_started"),
                "answers": user.get("freeTestAnswers"),
                "completedAt": user.get("freeTestCompletedAt")
            }
        else:
            return {
                "testType": "paid",
                "status": user.get("paidTestStatus", "not_started"),
                "answers": user.get("paidTestAnswers"),
                "completedAt": user.get("paidTestCompletedAt")
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

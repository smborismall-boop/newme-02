from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from routes.admin import verify_token
from datetime import datetime

router = APIRouter(prefix="/api/test-access", tags=["test-access"])
db = get_db()

class TestAccessResponse(BaseModel):
    canTakeFreeTest: bool
    hasTakenFreeTest: bool
    canTakePaidTest: bool
    message: str

@router.get("/check", response_model=TestAccessResponse)
async def check_test_access(token_data: dict = Depends(verify_token)):
    """
    Check if user can take free or paid test
    Rules:
    - Free test: Only once per user
    - Paid test: Unlimited if user has paid access
    """
    try:
        user_email = token_data.get("sub")
        
        # Check if user has taken free test before
        free_test_history = await db.test_results.find_one({
            "userEmail": user_email,
            "testType": "free"
        })
        
        has_taken_free = free_test_history is not None
        
        # Check if user has paid access
        # TODO: Check payment status in user profile or payments collection
        user = await db.users.find_one({"email": user_email}, {"_id": 0})
        has_paid_access = user.get("hasPaidAccess", False) if user else False
        
        if has_taken_free and not has_paid_access:
            return TestAccessResponse(
                canTakeFreeTest=False,
                hasTakenFreeTest=True,
                canTakePaidTest=False,
                message="Anda sudah mengambil test gratis. Upgrade ke premium untuk test unlimited!"
            )
        elif has_taken_free and has_paid_access:
            return TestAccessResponse(
                canTakeFreeTest=False,
                hasTakenFreeTest=True,
                canTakePaidTest=True,
                message="Anda memiliki akses premium. Silakan ambil test berbayar!"
            )
        else:
            return TestAccessResponse(
                canTakeFreeTest=True,
                hasTakenFreeTest=False,
                canTakePaidTest=has_paid_access,
                message="Selamat! Anda dapat mengambil test gratis."
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/record-free-test")
async def record_free_test(
    category: str,
    token_data: dict = Depends(verify_token)
):
    """
    Record that user has taken free test
    """
    try:
        user_email = token_data.get("sub")
        
        # Check if already taken
        existing = await db.test_results.find_one({
            "userEmail": user_email,
            "testType": "free",
            "category": category
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Anda sudah mengambil test gratis untuk kategori ini")
        
        # Record free test
        test_record = {
            "userEmail": user_email,
            "testType": "free",
            "category": category,
            "takenAt": datetime.utcnow()
        }
        
        await db.test_results.insert_one(test_record)
        
        return {
            "success": True,
            "message": "Test gratis berhasil direkam"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/history")
async def get_test_history(token_data: dict = Depends(verify_token)):
    """
    Get user's test history
    """
    try:
        user_email = token_data.get("sub")
        
        cursor = db.test_results.find(
            {"userEmail": user_email},
            {"_id": 0}
        ).sort("takenAt", -1)
        
        history = await cursor.to_list(length=100)
        
        return {
            "success": True,
            "history": history,
            "totalTests": len(history)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

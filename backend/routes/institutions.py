from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.institution import InstitutionInquiryCreate, InstitutionInquiry
from database import get_db
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/institutions", tags=["institutions"])

# Get database instance
db = get_db()

@router.post("/inquiry", response_model=dict)
async def create_institution_inquiry(inquiry: InstitutionInquiryCreate):
    """
    Submit an institution inquiry for Kelas Gali Bakat
    """
    try:
        inquiry_dict = inquiry.dict()
        inquiry_dict["status"] = "inquiry"
        inquiry_dict["createdAt"] = datetime.utcnow()
        
        result = await db.institutions.insert_one(inquiry_dict)
        
        return {
            "success": True,
            "id": str(result.inserted_id),
            "message": "Inquiry Anda telah diterima. Tim kami akan segera menghubungi Anda."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("", response_model=List[dict])
async def get_institutions(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None
):
    """
    Get all institution inquiries (for admin)
    """
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.institutions.find(query).skip(skip).limit(limit).sort("createdAt", -1)
        institutions = await cursor.to_list(length=limit)
        
        for inst in institutions:
            inst["_id"] = str(inst["_id"])
        
        return institutions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("/{institution_id}", response_model=dict)
async def get_institution(institution_id: str):
    """
    Get a single institution inquiry by ID
    """
    try:
        if not ObjectId.is_valid(institution_id):
            raise HTTPException(status_code=400, detail="Invalid institution ID")
        
        institution = await db.institutions.find_one({"_id": ObjectId(institution_id)})
        if not institution:
            raise HTTPException(status_code=404, detail="Institution tidak ditemukan")
        
        institution["_id"] = str(institution["_id"])
        return institution
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.put("/{institution_id}/status", response_model=dict)
async def update_institution_status(institution_id: str, status: str):
    """
    Update institution inquiry status
    """
    try:
        if not ObjectId.is_valid(institution_id):
            raise HTTPException(status_code=400, detail="Invalid institution ID")
        
        result = await db.institutions.update_one(
            {"_id": ObjectId(institution_id)},
            {"$set": {"status": status}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Institution tidak ditemukan")
        
        return {"message": "Status berhasil diupdate", "status": status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("/stats/summary", response_model=dict)
async def get_institution_stats():
    """
    Get institution statistics
    """
    try:
        total = await db.institutions.count_documents({})
        inquiry = await db.institutions.count_documents({"status": "inquiry"})
        scheduled = await db.institutions.count_documents({"status": "scheduled"})
        completed = await db.institutions.count_documents({"status": "completed"})
        
        return {
            "total": total,
            "inquiry": inquiry,
            "scheduled": scheduled,
            "completed": completed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")
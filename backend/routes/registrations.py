from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional
from models.registration import RegistrationCreate, Registration, RegistrationResponse
from database import get_db
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/registrations", tags=["registrations"])

# Get database instance
db = get_db()

@router.post("", response_model=RegistrationResponse)
async def create_registration(registration: RegistrationCreate, request: Request):
    """
    Create a new NEWME Test registration
    """
    try:
        # Check if email already exists
        existing = await db.registrations.find_one({"email": registration.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar. Silakan gunakan email lain.")
        
        # Create registration document
        registration_dict = registration.dict()
        registration_dict["testStatus"] = "pending"
        registration_dict["registrationDate"] = datetime.utcnow()
        registration_dict["isMember"] = False
        registration_dict["ipAddress"] = request.client.host
        registration_dict["userAgent"] = request.headers.get("user-agent")
        
        result = await db.registrations.insert_one(registration_dict)
        
        # Return response
        return RegistrationResponse(
            id=str(result.inserted_id),
            name=registration.name,
            email=registration.email,
            testStatus="pending",
            registrationDate=registration_dict["registrationDate"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("", response_model=List[dict])
async def get_registrations(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None
):
    """
    Get all registrations (for admin)
    """
    try:
        query = {}
        if status:
            query["testStatus"] = status
        
        cursor = db.registrations.find(query).skip(skip).limit(limit).sort("registrationDate", -1)
        registrations = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for reg in registrations:
            reg["_id"] = str(reg["_id"])
        
        return registrations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("/{registration_id}", response_model=dict)
async def get_registration(registration_id: str):
    """
    Get a single registration by ID
    """
    try:
        if not ObjectId.is_valid(registration_id):
            raise HTTPException(status_code=400, detail="Invalid registration ID")
        
        registration = await db.registrations.find_one({"_id": ObjectId(registration_id)})
        if not registration:
            raise HTTPException(status_code=404, detail="Pendaftaran tidak ditemukan")
        
        registration["_id"] = str(registration["_id"])
        return registration
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("/stats/summary", response_model=dict)
async def get_registration_stats():
    """
    Get registration statistics
    """
    try:
        total = await db.registrations.count_documents({})
        pending = await db.registrations.count_documents({"testStatus": "pending"})
        completed = await db.registrations.count_documents({"testStatus": "completed"})
        in_progress = await db.registrations.count_documents({"testStatus": "in-progress"})
        
        return {
            "total": total,
            "pending": pending,
            "completed": completed,
            "inProgress": in_progress
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")
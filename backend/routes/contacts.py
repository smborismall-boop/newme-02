from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.contact import ContactCreate, Contact, ContactResponse
from database import get_db
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/contacts", tags=["contacts"])

# Get database instance
db = get_db()

@router.post("", response_model=ContactResponse)
async def create_contact(contact: ContactCreate):
    """
    Submit a contact form
    """
    try:
        contact_dict = contact.dict()
        contact_dict["status"] = "new"
        contact_dict["submittedAt"] = datetime.utcnow()
        
        result = await db.contacts.insert_one(contact_dict)
        
        return ContactResponse(
            id=str(result.inserted_id),
            name=contact.name,
            email=contact.email,
            status="new",
            submittedAt=contact_dict["submittedAt"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("", response_model=List[dict])
async def get_contacts(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None
):
    """
    Get all contacts (for admin)
    """
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.contacts.find(query).skip(skip).limit(limit).sort("submittedAt", -1)
        contacts = await cursor.to_list(length=limit)
        
        for contact in contacts:
            contact["_id"] = str(contact["_id"])
        
        return contacts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("/{contact_id}", response_model=dict)
async def get_contact(contact_id: str):
    """
    Get a single contact by ID
    """
    try:
        if not ObjectId.is_valid(contact_id):
            raise HTTPException(status_code=400, detail="Invalid contact ID")
        
        contact = await db.contacts.find_one({"_id": ObjectId(contact_id)})
        if not contact:
            raise HTTPException(status_code=404, detail="Kontak tidak ditemukan")
        
        contact["_id"] = str(contact["_id"])
        return contact
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.put("/{contact_id}/status", response_model=dict)
async def update_contact_status(contact_id: str, status: str, notes: Optional[str] = None):
    """
    Update contact status
    """
    try:
        if not ObjectId.is_valid(contact_id):
            raise HTTPException(status_code=400, detail="Invalid contact ID")
        
        update_data = {
            "status": status
        }
        
        if status == "replied":
            update_data["repliedAt"] = datetime.utcnow()
        
        if notes:
            update_data["notes"] = notes
        
        result = await db.contacts.update_one(
            {"_id": ObjectId(contact_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Kontak tidak ditemukan")
        
        return {"message": "Status berhasil diupdate", "status": status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("/stats/summary", response_model=dict)
async def get_contact_stats():
    """
    Get contact statistics
    """
    try:
        total = await db.contacts.count_documents({})
        new = await db.contacts.count_documents({"status": "new"})
        read = await db.contacts.count_documents({"status": "read"})
        replied = await db.contacts.count_documents({"status": "replied"})
        closed = await db.contacts.count_documents({"status": "closed"})
        
        return {
            "total": total,
            "new": new,
            "read": read,
            "replied": replied,
            "closed": closed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")
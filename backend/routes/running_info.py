from fastapi import APIRouter, HTTPException, Depends, Form
from typing import List, Optional
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.admin import verify_token

router = APIRouter(prefix="/api/running-info", tags=["running-info"])
db = get_db()

@router.get("", response_model=List[dict])
async def get_running_info(isActive: Optional[bool] = None):
    """
    Get running info/marquee messages (public)
    """
    try:
        query = {}
        if isActive is not None:
            query["isActive"] = isActive
        
        # Filter by date range if set
        now = datetime.utcnow()
        query["$or"] = [
            {"startDate": None, "endDate": None},
            {"startDate": {"$lte": now}, "endDate": None},
            {"startDate": None, "endDate": {"$gte": now}},
            {"startDate": {"$lte": now}, "endDate": {"$gte": now}}
        ]
        
        cursor = db.running_info.find(query).sort("priority", -1)
        infos = await cursor.to_list(100)
        
        for info in infos:
            info["_id"] = str(info["_id"])
        
        return infos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/all", response_model=List[dict])
async def get_all_running_info(token_data: dict = Depends(verify_token)):
    """
    Get all running info without filter (admin only)
    """
    try:
        cursor = db.running_info.find({}).sort("priority", -1)
        infos = await cursor.to_list(100)
        
        for info in infos:
            info["_id"] = str(info["_id"])
        
        return infos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("", response_model=dict)
async def create_running_info(
    message: str = Form(...),
    isActive: bool = Form(True),
    priority: int = Form(0),
    startDate: str = Form(None),
    endDate: str = Form(None),
    linkUrl: str = Form(None),
    linkText: str = Form(None),
    bgColor: str = Form("#FFD700"),
    textColor: str = Form("#1a1a1a"),
    token_data: dict = Depends(verify_token)
):
    """
    Create new running info (admin only)
    """
    try:
        info_doc = {
            "message": message,
            "isActive": isActive,
            "priority": priority,
            "linkUrl": linkUrl,
            "linkText": linkText,
            "bgColor": bgColor,
            "textColor": textColor,
            "createdAt": datetime.utcnow()
        }
        
        if startDate:
            info_doc["startDate"] = datetime.fromisoformat(startDate.replace('Z', '+00:00'))
        if endDate:
            info_doc["endDate"] = datetime.fromisoformat(endDate.replace('Z', '+00:00'))
        
        result = await db.running_info.insert_one(info_doc)
        
        return {
            "success": True,
            "id": str(result.inserted_id),
            "message": "Informasi berjalan berhasil dibuat"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/{info_id}", response_model=dict)
async def update_running_info(
    info_id: str,
    message: str = Form(None),
    isActive: bool = Form(None),
    priority: int = Form(None),
    startDate: str = Form(None),
    endDate: str = Form(None),
    linkUrl: str = Form(None),
    linkText: str = Form(None),
    bgColor: str = Form(None),
    textColor: str = Form(None),
    token_data: dict = Depends(verify_token)
):
    """
    Update running info (admin only)
    """
    try:
        if not ObjectId.is_valid(info_id):
            raise HTTPException(status_code=400, detail="Invalid ID")
        
        update_data = {"updatedAt": datetime.utcnow()}
        
        if message is not None:
            update_data["message"] = message
        if isActive is not None:
            update_data["isActive"] = isActive
        if priority is not None:
            update_data["priority"] = priority
        if linkUrl is not None:
            update_data["linkUrl"] = linkUrl
        if linkText is not None:
            update_data["linkText"] = linkText
        if bgColor is not None:
            update_data["bgColor"] = bgColor
        if textColor is not None:
            update_data["textColor"] = textColor
        if startDate:
            update_data["startDate"] = datetime.fromisoformat(startDate.replace('Z', '+00:00'))
        if endDate:
            update_data["endDate"] = datetime.fromisoformat(endDate.replace('Z', '+00:00'))
        
        result = await db.running_info.update_one(
            {"_id": ObjectId(info_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Informasi tidak ditemukan")
        
        return {"success": True, "message": "Informasi berhasil diupdate"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/{info_id}", response_model=dict)
async def delete_running_info(
    info_id: str,
    token_data: dict = Depends(verify_token)
):
    """
    Delete running info (admin only)
    """
    try:
        if not ObjectId.is_valid(info_id):
            raise HTTPException(status_code=400, detail="Invalid ID")
        
        result = await db.running_info.delete_one({"_id": ObjectId(info_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Informasi tidak ditemukan")
        
        return {"success": True, "message": "Informasi berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from typing import List, Optional
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.admin import verify_token
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/banners", tags=["banners"])
db = get_db()

# Upload directory
UPLOAD_DIR = Path("/app/frontend/public/uploads/banners")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("", response_model=List[dict])
async def get_banners(
    type: Optional[str] = None,
    isActive: Optional[bool] = None
):
    """
    Get all banners (public)
    """
    try:
        query = {}
        if type:
            query["type"] = type
        if isActive is not None:
            query["isActive"] = isActive
        
        cursor = db.banners.find(query).sort("order", 1)
        banners = await cursor.to_list(100)
        
        for banner in banners:
            banner["_id"] = str(banner["_id"])
        
        return banners
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/{banner_id}", response_model=dict)
async def get_banner(banner_id: str):
    """
    Get banner by ID
    """
    try:
        if not ObjectId.is_valid(banner_id):
            raise HTTPException(status_code=400, detail="Invalid banner ID")
        
        banner = await db.banners.find_one({"_id": ObjectId(banner_id)})
        if not banner:
            raise HTTPException(status_code=404, detail="Banner not found")
        
        banner["_id"] = str(banner["_id"])
        return banner
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("", response_model=dict)
async def create_banner(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    link: Optional[str] = Form(None),
    type: str = Form("slider"),
    order: int = Form(0),
    file: UploadFile = File(...),
    token_data: dict = Depends(verify_token)
):
    """
    Create new banner with image upload (admin only)
    """
    try:
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="File type not allowed")
        
        # Save file
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        banner_data = {
            "title": title,
            "description": description,
            "imageUrl": f"/uploads/banners/{unique_filename}",
            "link": link,
            "type": type,  # slider, popup
            "isActive": True,
            "order": order,
            "createdAt": datetime.utcnow(),
            "createdBy": token_data["sub"]
        }
        
        result = await db.banners.insert_one(banner_data)
        
        return {
            "success": True,
            "bannerId": str(result.inserted_id),
            "message": "Banner created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/{banner_id}", response_model=dict)
async def update_banner(
    banner_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    link: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    order: Optional[int] = Form(None),
    isActive: Optional[bool] = Form(None),
    file: Optional[UploadFile] = File(None),
    token_data: dict = Depends(verify_token)
):
    """
    Update banner (admin only)
    """
    try:
        if not ObjectId.is_valid(banner_id):
            raise HTTPException(status_code=400, detail="Invalid banner ID")
        
        update_data = {}
        
        if title is not None:
            update_data["title"] = title
        if description is not None:
            update_data["description"] = description
        if link is not None:
            update_data["link"] = link
        if type is not None:
            update_data["type"] = type
        if order is not None:
            update_data["order"] = order
        if isActive is not None:
            update_data["isActive"] = isActive
        
        # Handle new image upload
        if file:
            allowed_extensions = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
            file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
            
            if file_extension not in allowed_extensions:
                raise HTTPException(status_code=400, detail="File type not allowed")
            
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = UPLOAD_DIR / unique_filename
            
            contents = await file.read()
            with open(file_path, 'wb') as f:
                f.write(contents)
            
            update_data["imageUrl"] = f"/uploads/banners/{unique_filename}"
        
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.banners.update_one(
            {"_id": ObjectId(banner_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Banner not found")
        
        return {"success": True, "message": "Banner updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/{banner_id}", response_model=dict)
async def delete_banner(
    banner_id: str,
    token_data: dict = Depends(verify_token)
):
    """
    Delete banner (admin only)
    """
    try:
        if not ObjectId.is_valid(banner_id):
            raise HTTPException(status_code=400, detail="Invalid banner ID")
        
        result = await db.banners.delete_one({"_id": ObjectId(banner_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Banner not found")
        
        return {"success": True, "message": "Banner deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/reorder", response_model=dict)
async def reorder_banners(
    orders: List[dict],
    token_data: dict = Depends(verify_token)
):
    """
    Reorder banners (admin only)
    """
    try:
        for item in orders:
            if ObjectId.is_valid(item["id"]):
                await db.banners.update_one(
                    {"_id": ObjectId(item["id"])},
                    {"$set": {"order": item["order"]}}
                )
        
        return {"success": True, "message": "Banners reordered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

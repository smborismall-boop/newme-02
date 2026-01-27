from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from models.settings import SiteSettings, SettingsUpdate
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.admin import verify_token
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/settings", tags=["settings"])
db = get_db()

# Upload directory
UPLOAD_DIR = Path("/app/frontend/public/uploads/site")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def serialize_settings(settings: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict"""
    if not settings:
        return {}
    result = {}
    for key, value in settings.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [
                serialize_settings(item) if isinstance(item, dict) else item
                for item in value
            ]
        elif isinstance(value, dict):
            result[key] = serialize_settings(value)
        else:
            result[key] = value
    return result

@router.get("", response_model=dict)
async def get_settings():
    """
    Get site settings (public)
    """
    try:
        settings = await db.settings.find_one()
        if not settings:
            # Create default settings without _id field
            default_settings = {
                "siteName": "NEWME CLASS",
                "siteTitle": "NEWME CLASS - Kelas Peduli Talenta",
                "siteDescription": "Platform pengembangan talenta dan potensi diri",
                "logoUrl": None,
                "faviconUrl": None,
                "email": "newmeclass@gmail.com",
                "phone": "0895.0267.1691",
                "whatsapp": "6289502671691",
                "address": "Jl. Puskesmas I - Komp. Golden Seroja - A1",
                "instagram": "@newmeclass",
                "primaryColor": "#FFD700",
                "secondaryColor": "#1a1a1a",
                "accentColor": "#2a2a2a",
                "backgroundColor": "#1a1a1a",
                "textColor": "#ffffff",
                "banners": [],
                "seoKeywords": None,
                "seoMetaDescription": None,
                "googleAnalyticsId": None,
                "facebookPixelId": None,
                "maintenanceMode": False,
                "maintenanceMessage": None,
                "allowRegistration": True,
                "requirePayment": True,
                "paymentAmount": 50000.0,
                "certificateTemplateUrl": None,
                "certificateSignatureUrl": None,
                "updatedAt": datetime.utcnow()
            }
            result = await db.settings.insert_one(default_settings)
            settings = await db.settings.find_one({"_id": result.inserted_id})
        
        return serialize_settings(settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("", response_model=dict)
async def update_settings(
    updates: SettingsUpdate,
    token_data: dict = Depends(verify_token)
):
    """
    Update site settings (admin only)
    """
    try:
        settings = await db.settings.find_one()
        if not settings:
            raise HTTPException(status_code=404, detail="Settings not found")
        
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        update_data["updatedBy"] = token_data["sub"]
        
        await db.settings.update_one(
            {"_id": settings["_id"]},
            {"$set": update_data}
        )
        
        return {"success": True, "message": "Settings updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/upload/team", response_model=dict)
async def upload_team_photo(
    file: UploadFile = File(...),
    token_data: dict = Depends(verify_token)
):
    """
    Upload team member photo (admin only)
    """
    try:
        # Create team uploads directory
        team_upload_dir = Path("/app/frontend/public/uploads/team")
        team_upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Save file
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'png'
        unique_filename = f"team_{uuid.uuid4()}.{file_extension}"
        file_path = team_upload_dir / unique_filename
        
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        file_url = f"/uploads/team/{unique_filename}"
        
        return {"success": True, "url": file_url, "message": "Team photo uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/upload/{asset_type}", response_model=dict)
async def upload_asset(
    asset_type: str,  # logo, favicon, banner, certificate
    file: UploadFile = File(...),
    token_data: dict = Depends(verify_token)
):
    """
    Upload site assets (admin only)
    """
    try:
        allowed_types = ['logo', 'favicon', 'banner', 'certificate', 'signature']
        if asset_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid asset type")
        
        # Save file
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'png'
        unique_filename = f"{asset_type}_{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        file_url = f"/uploads/site/{unique_filename}"
        
        # Update settings based on asset type
        settings = await db.settings.find_one()
        if settings:
            update_field = {}
            if asset_type == 'logo':
                update_field = {"logoUrl": file_url}
            elif asset_type == 'favicon':
                update_field = {"faviconUrl": file_url}
            elif asset_type == 'certificate':
                update_field = {"certificateTemplateUrl": file_url}
            elif asset_type == 'signature':
                update_field = {"certificateSignatureUrl": file_url}
            elif asset_type == 'banner':
                # Add to banners array
                await db.settings.update_one(
                    {"_id": settings["_id"]},
                    {"$push": {"banners": {
                        "url": file_url,
                        "title": "",
                        "description": "",
                        "link": "",
                        "order": 0
                    }}}
                )
                return {"success": True, "url": file_url, "message": "Banner uploaded"}
            
            if update_field:
                await db.settings.update_one(
                    {"_id": settings["_id"]},
                    {"$set": update_field}
                )
        
        return {"success": True, "url": file_url, "message": f"{asset_type} uploaded successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/banner/{index}", response_model=dict)
async def delete_banner(
    index: int,
    token_data: dict = Depends(verify_token)
):
    """
    Delete banner by index
    """
    try:
        settings = await db.settings.find_one()
        if not settings or not settings.get("banners"):
            raise HTTPException(status_code=404, detail="No banners found")
        
        banners = settings["banners"]
        if index < 0 or index >= len(banners):
            raise HTTPException(status_code=400, detail="Invalid banner index")
        
        banners.pop(index)
        
        await db.settings.update_one(
            {"_id": settings["_id"]},
            {"$set": {"banners": banners}}
        )
        
        return {"success": True, "message": "Banner deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
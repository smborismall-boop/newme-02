from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.admin import verify_token
import os
import uuid
import re
from pathlib import Path

router = APIRouter(prefix="/api/articles", tags=["articles"])
db = get_db()

UPLOAD_DIR = Path("uploads/articles")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def create_slug(title: str) -> str:
    """Create URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = slug.strip('-')
    return slug

@router.get("", response_model=List[dict])
async def get_articles(
    category: Optional[str] = None,
    isPublished: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    """
    Get all articles (public)
    """
    try:
        query = {}
        if category:
            query["category"] = category
        if isPublished is not None:
            query["isPublished"] = isPublished
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"content": {"$regex": search, "$options": "i"}}
            ]
        
        cursor = db.articles.find(query).skip(skip).limit(limit).sort("publishedAt", -1)
        articles = await cursor.to_list(length=limit)
        
        for article in articles:
            article["_id"] = str(article["_id"])
        
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/{article_id}", response_model=dict)
async def get_article(article_id: str):
    """
    Get single article by ID or slug
    """
    try:
        # Try to find by _id first (can be UUID string or MongoDB ObjectId)
        article = await db.articles.find_one({"_id": article_id})
        
        if not article:
            # Try MongoDB ObjectId format
            if ObjectId.is_valid(article_id):
                article = await db.articles.find_one({"_id": ObjectId(article_id)})
        
        if not article:
            # Try to find by slug
            article = await db.articles.find_one({"slug": article_id})
        
        if not article:
            raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
        
        # Increment view count
        await db.articles.update_one(
            {"_id": article["_id"]},
            {"$inc": {"views": 1}}
        )
        
        # Convert _id to string if it's ObjectId
        if isinstance(article["_id"], ObjectId):
            article["_id"] = str(article["_id"])
        
        return article
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting article: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("", response_model=dict)
async def create_article(
    title: str = Form(...),
    content: str = Form(...),
    excerpt: str = Form(None),
    category: str = Form("berita"),
    tags: str = Form(""),  # Comma separated
    isPublished: bool = Form(True),
    file: UploadFile = File(None),
    token_data: dict = Depends(verify_token)
):
    """
    Create new article (admin only)
    """
    try:
        slug = create_slug(title)
        
        # Check if slug exists
        existing = await db.articles.find_one({"slug": slug})
        if existing:
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"
        
        article_doc = {
            "title": title,
            "slug": slug,
            "excerpt": excerpt or content[:200] + "...",
            "content": content,
            "category": category,
            "tags": [t.strip() for t in tags.split(",") if t.strip()],
            "author": "Admin",
            "isPublished": isPublished,
            "publishedAt": datetime.utcnow() if isPublished else None,
            "viewCount": 0,
            "createdAt": datetime.utcnow()
        }
        
        # Handle image upload
        if file and file.filename:
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
                raise HTTPException(status_code=400, detail="Format file tidak didukung")
            
            filename = f"{uuid.uuid4().hex}{ext}"
            file_path = UPLOAD_DIR / filename
            
            with open(file_path, "wb") as f:
                content_bytes = await file.read()
                f.write(content_bytes)
            
            article_doc["featuredImage"] = f"/uploads/articles/{filename}"
        
        result = await db.articles.insert_one(article_doc)
        
        return {
            "success": True,
            "articleId": str(result.inserted_id),
            "slug": slug,
            "message": "Artikel berhasil dibuat"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/{article_id}", response_model=dict)
async def update_article(
    article_id: str,
    title: str = Form(None),
    content: str = Form(None),
    excerpt: str = Form(None),
    category: str = Form(None),
    tags: str = Form(None),
    isPublished: bool = Form(None),
    file: UploadFile = File(None),
    token_data: dict = Depends(verify_token)
):
    """
    Update article (admin only)
    """
    try:
        if not ObjectId.is_valid(article_id):
            raise HTTPException(status_code=400, detail="Invalid article ID")
        
        update_data = {"updatedAt": datetime.utcnow()}
        
        if title:
            update_data["title"] = title
            update_data["slug"] = create_slug(title)
        if content:
            update_data["content"] = content
        if excerpt:
            update_data["excerpt"] = excerpt
        if category:
            update_data["category"] = category
        if tags is not None:
            update_data["tags"] = [t.strip() for t in tags.split(",") if t.strip()]
        if isPublished is not None:
            update_data["isPublished"] = isPublished
            if isPublished:
                update_data["publishedAt"] = datetime.utcnow()
        
        # Handle image upload
        if file and file.filename:
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
                raise HTTPException(status_code=400, detail="Format file tidak didukung")
            
            filename = f"{uuid.uuid4().hex}{ext}"
            file_path = UPLOAD_DIR / filename
            
            with open(file_path, "wb") as f:
                content_bytes = await file.read()
                f.write(content_bytes)
            
            update_data["featuredImage"] = f"/uploads/articles/{filename}"
        
        result = await db.articles.update_one(
            {"_id": ObjectId(article_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
        
        return {"success": True, "message": "Artikel berhasil diupdate"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/{article_id}", response_model=dict)
async def delete_article(
    article_id: str,
    token_data: dict = Depends(verify_token)
):
    """
    Delete article (admin only)
    """
    try:
        if not ObjectId.is_valid(article_id):
            raise HTTPException(status_code=400, detail="Invalid article ID")
        
        # Get article to delete image if exists
        article = await db.articles.find_one({"_id": ObjectId(article_id)})
        if article and article.get("featuredImage"):
            image_path = Path(article["featuredImage"].lstrip("/"))
            if image_path.exists():
                image_path.unlink()
        
        result = await db.articles.delete_one({"_id": ObjectId(article_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
        
        return {"success": True, "message": "Artikel berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/stats/summary", response_model=dict)
async def get_article_stats(token_data: dict = Depends(verify_token)):
    """
    Get article statistics (admin only)
    """
    try:
        total = await db.articles.count_documents({})
        published = await db.articles.count_documents({"isPublished": True})
        draft = await db.articles.count_documents({"isPublished": False})
        
        # Total views
        pipeline = [
            {"$group": {"_id": None, "totalViews": {"$sum": "$viewCount"}}}
        ]
        result = await db.articles.aggregate(pipeline).to_list(1)
        total_views = result[0]["totalViews"] if result else 0
        
        return {
            "total": total,
            "published": published,
            "draft": draft,
            "totalViews": total_views
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

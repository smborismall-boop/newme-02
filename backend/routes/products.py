from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from typing import List, Optional
from models.product import Product, ProductCreate, ProductUpdate
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.admin import verify_token
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/products", tags=["products"])
db = get_db()

# Upload directory
UPLOAD_DIR = Path("/app/frontend/public/uploads/products")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("", response_model=List[dict])
async def get_products(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    isActive: Optional[bool] = None
):
    """
    Get all products (public)
    """
    try:
        query = {}
        if category:
            query["category"] = category
        if isActive is not None:
            query["isActive"] = isActive
        
        cursor = db.products.find(query).skip(skip).limit(limit).sort("createdAt", -1)
        products = await cursor.to_list(length=limit)
        
        for product in products:
            product["_id"] = str(product["_id"])
        
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/{product_id}", response_model=dict)
async def get_product(product_id: str):
    """
    Get product by ID
    """
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
        
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product["_id"] = str(product["_id"])
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("", response_model=dict)
async def create_product(
    product: ProductCreate,
    token_data: dict = Depends(verify_token)
):
    """
    Create new product (admin only)
    """
    try:
        product_data = product.dict()
        product_data["createdAt"] = datetime.utcnow()
        product_data["updatedAt"] = datetime.utcnow()
        product_data["createdBy"] = token_data["sub"]
        
        result = await db.products.insert_one(product_data)
        
        return {
            "success": True,
            "productId": str(result.inserted_id),
            "message": "Product created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/{product_id}", response_model=dict)
async def update_product(
    product_id: str,
    updates: ProductUpdate,
    token_data: dict = Depends(verify_token)
):
    """
    Update product (admin only)
    """
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
        
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {"success": True, "message": "Product updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/{product_id}", response_model=dict)
async def delete_product(
    product_id: str,
    token_data: dict = Depends(verify_token)
):
    """
    Delete product (admin only)
    """
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
        
        result = await db.products.delete_one({"_id": ObjectId(product_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {"success": True, "message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/upload-image", response_model=dict)
async def upload_product_image(
    file: UploadFile = File(...),
    token_data: dict = Depends(verify_token)
):
    """
    Upload product image (admin only)
    """
    try:
        allowed_extensions = {'png', 'jpg', 'jpeg', 'webp'}
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="File type not allowed")
        
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        return {
            "success": True,
            "url": f"/uploads/products/{unique_filename}",
            "message": "Image uploaded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/categories/list", response_model=List[str])
async def get_categories():
    """
    Get all product categories
    """
    try:
        categories = await db.products.distinct("category")
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/stats/summary", response_model=dict)
async def get_product_stats(token_data: dict = Depends(verify_token)):
    """
    Get product statistics (admin only)
    """
    try:
        total = await db.products.count_documents({})
        active = await db.products.count_documents({"isActive": True})
        out_of_stock = await db.products.count_documents({"stock": 0})
        
        # Get categories count
        categories = await db.products.distinct("category")
        
        return {
            "total": total,
            "active": active,
            "inactive": total - active,
            "outOfStock": out_of_stock,
            "categoriesCount": len(categories)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

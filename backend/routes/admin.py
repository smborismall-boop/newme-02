from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from models.admin import AdminCreate, AdminLogin, Admin, AdminResponse, Token
from database import get_db
import os
from datetime import datetime, timedelta
from bson import ObjectId
from passlib.context import CryptContext
import jwt

router = APIRouter(prefix="/api/admin", tags=["admin"])
security = HTTPBearer()

# Get database instance
db = get_db()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@router.post("/register", response_model=AdminResponse)
async def register_admin(admin: AdminCreate):
    """
    Register a new admin (for initial setup only)
    """
    try:
        # Check if admin already exists
        existing = await db.admin_users.find_one({"email": admin.email})
        if existing:
            raise HTTPException(status_code=400, detail="Admin dengan email ini sudah terdaftar")
        
        # Hash password
        hashed_password = hash_password(admin.password)
        
        admin_dict = {
            "username": admin.username,
            "email": admin.email,
            "password": hashed_password,
            "role": admin.role,
            "createdAt": datetime.utcnow()
        }
        
        result = await db.admin_users.insert_one(admin_dict)
        
        return AdminResponse(
            id=str(result.inserted_id),
            username=admin.username,
            email=admin.email,
            role=admin.role
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.post("/login", response_model=Token)
async def login_admin(credentials: AdminLogin):
    """
    Admin login
    """
    try:
        # Find admin by email
        admin = await db.admin_users.find_one({"email": credentials.email})
        if not admin:
            raise HTTPException(status_code=401, detail="Email atau password salah")
        
        # Verify password
        if not verify_password(credentials.password, admin["password"]):
            raise HTTPException(status_code=401, detail="Email atau password salah")
        
        # Update last login
        await db.admin_users.update_one(
            {"_id": admin["_id"]},
            {"$set": {"lastLogin": datetime.utcnow()}}
        )
        
        # Create access token
        access_token = create_access_token(data={"sub": admin["email"], "role": admin["role"]})
        
        return Token(
            access_token=access_token,
            user=AdminResponse(
                id=str(admin["_id"]),
                username=admin["username"],
                email=admin["email"],
                role=admin["role"]
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("/dashboard/stats", response_model=dict)
async def get_dashboard_stats(token_data: dict = Depends(verify_token)):
    """
    Get dashboard statistics
    """
    try:
        # Get counts
        total_registrations = await db.registrations.count_documents({})
        pending_registrations = await db.registrations.count_documents({"testStatus": "pending"})
        total_contacts = await db.contacts.count_documents({})
        new_contacts = await db.contacts.count_documents({"status": "new"})
        total_institutions = await db.institutions.count_documents({})
        pending_institutions = await db.institutions.count_documents({"status": "inquiry"})
        
        # Get recent registrations (optimized with projections)
        recent_registrations = await db.registrations.find(
            {}, 
            {"name": 1, "email": 1, "testStatus": 1, "registrationDate": 1}
        ).sort("registrationDate", -1).limit(5).to_list(5)
        for reg in recent_registrations:
            reg["_id"] = str(reg["_id"])
        
        # Get recent contacts (optimized with projections)
        recent_contacts = await db.contacts.find(
            {}, 
            {"name": 1, "email": 1, "message": 1, "status": 1, "submittedAt": 1}
        ).sort("submittedAt", -1).limit(5).to_list(5)
        for contact in recent_contacts:
            contact["_id"] = str(contact["_id"])
        
        return {
            "registrations": {
                "total": total_registrations,
                "pending": pending_registrations,
                "recent": recent_registrations
            },
            "contacts": {
                "total": total_contacts,
                "new": new_contacts,
                "recent": recent_contacts
            },
            "institutions": {
                "total": total_institutions,
                "pending": pending_institutions
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@router.get("/me", response_model=AdminResponse)
async def get_current_admin(token_data: dict = Depends(verify_token)):
    """
    Get current admin info
    """
    try:
        admin = await db.admin_users.find_one({"email": token_data["sub"]})
        if not admin:
            raise HTTPException(status_code=404, detail="Admin tidak ditemukan")
        
        return AdminResponse(
            id=str(admin["_id"]),
            username=admin["username"],
            email=admin["email"],
            role=admin["role"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")


# ========== Admin User Management ==========

@router.get("/users", response_model=List[dict])
async def get_all_admins(token_data: dict = Depends(verify_token)):
    """
    Get all admin users (superadmin only)
    """
    try:
        if token_data.get("role") != "superadmin":
            raise HTTPException(status_code=403, detail="Hanya superadmin yang dapat mengakses")
        
        admins = await db.admin_users.find({}, {"password": 0}).to_list(100)
        for admin in admins:
            admin["_id"] = str(admin["_id"])
        return admins
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/users/create", response_model=dict)
async def create_admin_user(admin: AdminCreate, token_data: dict = Depends(verify_token)):
    """
    Create new admin user (superadmin only)
    """
    try:
        if token_data.get("role") != "superadmin":
            raise HTTPException(status_code=403, detail="Hanya superadmin yang dapat membuat admin baru")
        
        # Check if email exists
        existing = await db.admin_users.find_one({"email": admin.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")
        
        # Hash password
        hashed_password = hash_password(admin.password)
        
        admin_dict = {
            "username": admin.username,
            "email": admin.email,
            "password": hashed_password,
            "role": admin.role,
            "createdAt": datetime.utcnow(),
            "createdBy": token_data.get("sub")
        }
        
        result = await db.admin_users.insert_one(admin_dict)
        
        return {
            "success": True,
            "message": "Admin berhasil dibuat",
            "admin": {
                "id": str(result.inserted_id),
                "username": admin.username,
                "email": admin.email,
                "role": admin.role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/users/{admin_id}/change-password", response_model=dict)
async def change_admin_password(admin_id: str, password_data: dict, token_data: dict = Depends(verify_token)):
    """
    Change admin password (superadmin can change any, admin can change own)
    """
    try:
        current_admin = await db.admin_users.find_one({"email": token_data.get("sub")})
        target_admin = await db.admin_users.find_one({"_id": ObjectId(admin_id)})
        
        if not target_admin:
            raise HTTPException(status_code=404, detail="Admin tidak ditemukan")
        
        # Check permission: superadmin can change any, others only their own
        is_superadmin = token_data.get("role") == "superadmin"
        is_own_account = str(current_admin["_id"]) == admin_id
        
        if not is_superadmin and not is_own_account:
            raise HTTPException(status_code=403, detail="Anda hanya dapat mengubah password sendiri")
        
        new_password = password_data.get("newPassword")
        if not new_password or len(new_password) < 6:
            raise HTTPException(status_code=400, detail="Password minimal 6 karakter")
        
        # Hash and update password
        hashed_password = hash_password(new_password)
        await db.admin_users.update_one(
            {"_id": ObjectId(admin_id)},
            {"$set": {"password": hashed_password, "updatedAt": datetime.utcnow()}}
        )
        
        return {
            "success": True,
            "message": "Password berhasil diubah"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/users/{admin_id}", response_model=dict)
async def delete_admin_user(admin_id: str, token_data: dict = Depends(verify_token)):
    """
    Delete admin user (superadmin only, cannot delete self)
    """
    try:
        if token_data.get("role") != "superadmin":
            raise HTTPException(status_code=403, detail="Hanya superadmin yang dapat menghapus admin")
        
        current_admin = await db.admin_users.find_one({"email": token_data.get("sub")})
        if str(current_admin["_id"]) == admin_id:
            raise HTTPException(status_code=400, detail="Tidak dapat menghapus akun sendiri")
        
        target_admin = await db.admin_users.find_one({"_id": ObjectId(admin_id)})
        if not target_admin:
            raise HTTPException(status_code=404, detail="Admin tidak ditemukan")
        
        await db.admin_users.delete_one({"_id": ObjectId(admin_id)})
        
        return {
            "success": True,
            "message": f"Admin {target_admin['email']} berhasil dihapus"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
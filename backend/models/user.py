from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from bson import ObjectId
from utils.objectid import PyObjectId
from enum import Enum
import uuid

class UserType(str, Enum):
    individual = "individual"
    institution = "institution"

class ReferralSource(str, Enum):
    google = "google"
    facebook = "facebook"
    iklan = "iklan"
    kerabat = "kerabat"
    instagram = "instagram"
    referral = "referral"
    other = "other"

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    fullName: str = Field(..., min_length=2, max_length=200)
    birthDate: str  # YYYY-MM-DD format
    whatsapp: str = Field(..., min_length=10)
    userType: UserType = UserType.individual
    referralSource: ReferralSource
    referralOther: Optional[str] = None
    referralCode: Optional[str] = None  # Kode referral yang digunakan
    
    # Location fields
    province: str
    city: str
    district: str
    village: Optional[str] = None
    address: Optional[str] = None
    
    # Institution specific fields
    institutionName: Optional[str] = None
    institutionAddress: Optional[str] = None
    position: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    hashedPassword: str
    fullName: str
    birthDate: str
    whatsapp: str
    userType: UserType = UserType.individual
    referralSource: ReferralSource
    referralOther: Optional[str] = None
    
    # Location
    province: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    address: Optional[str] = None
    
    # Institution specific
    institutionName: Optional[str] = None
    institutionAddress: Optional[str] = None
    position: Optional[str] = None
    
    # Referral system
    myReferralCode: Optional[str] = None  # Kode referral milik user ini
    usedReferralCode: Optional[str] = None  # Kode referral yang digunakan saat daftar
    referralCount: int = 0  # Jumlah orang yang pakai kode referral user ini
    referralBonus: float = 0  # Total bonus referral yang didapat
    
    # Status
    isActive: bool = True
    isBanned: bool = False
    bannedReason: Optional[str] = None
    isVerified: bool = False
    emailVerified: bool = False
    
    # Test related
    freeTestStatus: str = "not_started"  # not_started, in_progress, completed
    freeTestCompletedAt: Optional[datetime] = None
    freeTestAnswers: Optional[dict] = None
    
    paidTestStatus: str = "not_started"  # not_started, pending_payment, paid, in_progress, completed
    paidTestCompletedAt: Optional[datetime] = None
    paidTestAnswers: Optional[dict] = None
    
    paymentStatus: str = "unpaid"  # unpaid, pending, approved, rejected
    paymentMethod: Optional[str] = None
    paymentProofUrl: Optional[str] = None
    paymentDate: Optional[datetime] = None
    
    testResults: Optional[dict] = None
    certificateNumber: Optional[str] = None
    
    # Metadata
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    lastLoginAt: Optional[datetime] = None
    ipAddress: Optional[str] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    address: Optional[str] = None
    birthDate: Optional[str] = None
    whatsapp: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    institutionName: Optional[str] = None
    institutionAddress: Optional[str] = None
    position: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    fullName: str
    userType: str
    freeTestStatus: str
    paidTestStatus: str
    paymentStatus: str
    isVerified: bool
    myReferralCode: Optional[str] = None
    message: str = "Berhasil"

class PasswordChange(BaseModel):
    currentPassword: str
    newPassword: str = Field(..., min_length=6)

class AdminUserUpdate(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    birthDate: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    address: Optional[str] = None
    userType: Optional[str] = None
    institutionName: Optional[str] = None
    institutionAddress: Optional[str] = None
    position: Optional[str] = None
    isActive: Optional[bool] = None
    isBanned: Optional[bool] = None
    bannedReason: Optional[str] = None
    freeTestStatus: Optional[str] = None
    paidTestStatus: Optional[str] = None
    paymentStatus: Optional[str] = None

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from utils.objectid import PyObjectId

class ReferralSettings(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    bonusPerReferral: float = 10000  # Bonus per referral dalam Rupiah
    minimumWithdraw: float = 50000  # Minimum withdraw
    isActive: bool = True
    title: str = "Program Referral NEWME"
    description: str = "Dapatkan bonus setiap kali teman Anda mendaftar menggunakan kode referral Anda!"
    termsAndConditions: str = "1. Kode referral hanya berlaku untuk pendaftaran baru.\n2. Bonus akan diberikan setelah teman Anda menyelesaikan pembayaran.\n3. Bonus dapat ditarik setelah mencapai minimum withdraw."
    benefits: List[str] = [
        "Bonus Rp 10.000 per referral",
        "Tanpa batas maksimal referral",
        "Bonus langsung masuk ke saldo"
    ]
    updatedAt: Optional[datetime] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class ReferralTransaction(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    referrerId: str  # User yang punya kode referral
    referredId: str  # User yang menggunakan kode
    referralCode: str
    bonusAmount: float
    status: str = "pending"  # pending, credited, cancelled
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    creditedAt: Optional[datetime] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

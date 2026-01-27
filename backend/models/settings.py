from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime
from bson import ObjectId
from utils.objectid import PyObjectId

class SiteSettings(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    # Basic Info
    siteName: str = "NEWME CLASS"
    siteTitle: str = "NEWME CLASS - Kelas Peduli Talenta"
    siteDescription: str = "Platform pengembangan talenta dan potensi diri"
    logoUrl: Optional[str] = None
    faviconUrl: Optional[str] = None
    
    # Contact Info
    email: str = "newmeclass@gmail.com"
    phone: str = "0895.0267.1691"
    whatsapp: str = "6289502671691"
    address: str = "Jl. Puskesmas I - Komp. Golden Seroja - A1"
    instagram: str = "@newmeclass"
    
    # Theme Colors
    primaryColor: str = "#FFD700"  # Yellow
    secondaryColor: str = "#1a1a1a"  # Dark grey
    accentColor: str = "#2a2a2a"  # Medium grey
    backgroundColor: str = "#1a1a1a"
    textColor: str = "#ffffff"
    
    # Banner Sliders
    banners: List[Dict] = []
    
    # SEO
    seoKeywords: Optional[str] = None
    seoMetaDescription: Optional[str] = None
    googleAnalyticsId: Optional[str] = None
    facebookPixelId: Optional[str] = None
    
    # Features
    maintenanceMode: bool = False
    maintenanceMessage: Optional[str] = None
    allowRegistration: bool = True
    requirePayment: bool = True
    paymentAmount: float = 50000.0
    
    # Certificate
    certificateTemplateUrl: Optional[str] = None
    certificateSignatureUrl: Optional[str] = None
    
    # Team & BOD
    boardOfDirectors: List[Dict] = []  # [{"name": "", "position": "", "photo": ""}]
    teamSupport: List[Dict] = []  # [{"name": "", "position": "", "photo": ""}]
    partners: List[Dict] = []  # [{"name": "", "position": "", "photo": ""}]
    
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    updatedBy: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class SettingsUpdate(BaseModel):
    siteName: Optional[str] = None
    siteTitle: Optional[str] = None
    siteDescription: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    instagram: Optional[str] = None
    primaryColor: Optional[str] = None
    secondaryColor: Optional[str] = None
    accentColor: Optional[str] = None
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    seoKeywords: Optional[str] = None
    seoMetaDescription: Optional[str] = None
    googleAnalyticsId: Optional[str] = None
    facebookPixelId: Optional[str] = None
    maintenanceMode: Optional[bool] = None
    maintenanceMessage: Optional[str] = None
    allowRegistration: Optional[bool] = None
    # Payment Settings
    requirePayment: Optional[bool] = None
    paymentAmount: Optional[float] = None
    bankName: Optional[str] = None
    bankAccountNumber: Optional[str] = None
    bankAccountName: Optional[str] = None
    paymentInstructions: Optional[str] = None
    # QRIS Settings
    qrisEnabled: Optional[bool] = None
    qrisImageUrl: Optional[str] = None
    # Midtrans Settings
    midtransEnabled: Optional[bool] = None
    midtransServerKey: Optional[str] = None
    midtransClientKey: Optional[str] = None
    midtransIsProduction: Optional[bool] = None
    # Team & BOD
    boardOfDirectors: Optional[List[Dict]] = None
    teamSupport: Optional[List[Dict]] = None
    partners: Optional[List[Dict]] = None
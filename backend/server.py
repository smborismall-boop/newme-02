from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize database
from database import init_db
db = init_db()

# Import routes AFTER database initialization
from routes.registrations import router as registrations_router
from routes.contacts import router as contacts_router
from routes.institutions import router as institutions_router
from routes.admin import router as admin_router
from routes.payments import router as payments_router
from routes.settings import router as settings_router
from routes.analytics import router as analytics_router
from routes.users import router as users_router
from routes.products import router as products_router
from routes.questions import router as questions_router
from routes.banners import router as banners_router
from routes.transactions import router as transactions_router
from routes.certificates import router as certificates_router
from routes.auth import router as auth_router
from routes.user_payments import router as user_payments_router
from routes.referrals import router as referrals_router
from routes.articles import router as articles_router
from routes.running_info import router as running_info_router
from routes.personality_tests import router as personality_tests_router
from routes.test_access import router as test_access_router
from routes.ai_analysis import router as ai_analysis_router
from routes.website_content import router as website_content_router
from routes.wallet import router as wallet_router
from routes.test_results import router as test_results_router

# Create the main app without a prefix
app = FastAPI(
    title="NEWME CLASS API",
    description="API for NEWME CLASS - Kelas Peduli Talenta",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "NEWME CLASS API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@api_router.get("/health")
async def health_check():
    return {"status": "ok", "database": "connected"}

# Include all routers
app.include_router(registrations_router)
app.include_router(contacts_router)
app.include_router(institutions_router)
app.include_router(admin_router)
app.include_router(payments_router)
app.include_router(settings_router)
app.include_router(analytics_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(questions_router)
app.include_router(banners_router)
app.include_router(transactions_router)
app.include_router(certificates_router)
app.include_router(auth_router)
app.include_router(user_payments_router)
app.include_router(referrals_router)
app.include_router(articles_router)
app.include_router(running_info_router)
app.include_router(personality_tests_router)
app.include_router(test_access_router)
app.include_router(ai_analysis_router)
app.include_router(website_content_router)
app.include_router(wallet_router)
app.include_router(test_results_router)

# Include the base api router
app.include_router(api_router)

# Mount static files for uploads (served from frontend's public folder)
uploads_path = Path("/app/frontend/public/uploads")
if uploads_path.exists():
    app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database connection is managed by database.py
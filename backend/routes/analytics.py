from fastapi import APIRouter, HTTPException, Request, Depends
from models.analytics import PageView, OnlineUser
from database import get_db
from datetime import datetime, timedelta
from bson import ObjectId
from routes.admin import verify_token
import uuid

router = APIRouter(prefix="/api/analytics", tags=["analytics"])
db = get_db()

@router.post("/pageview")
async def track_pageview(request: Request, page: str, sessionId: str = None):
    """
    Track page view
    """
    try:
        if not sessionId:
            sessionId = str(uuid.uuid4())
        
        pageview_data = {
            "page": page,
            "referrer": request.headers.get("referer"),
            "userAgent": request.headers.get("user-agent"),
            "ipAddress": request.client.host,
            "sessionId": sessionId,
            "timestamp": datetime.utcnow()
        }
        
        await db.pageviews.insert_one(pageview_data)
        
        # Update or create online user
        await db.online_users.update_one(
            {"sessionId": sessionId},
            {"$set": {
                "ipAddress": request.client.host,
                "userAgent": request.headers.get("user-agent"),
                "lastActivity": datetime.utcnow(),
                "currentPage": page
            }},
            upsert=True
        )
        
        return {"success": True, "sessionId": sessionId}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/stats", response_model=dict)
async def get_analytics_stats(token_data: dict = Depends(verify_token)):
    """
    Get analytics statistics (admin only)
    """
    try:
        # Total page views
        total_views = await db.pageviews.count_documents({})
        
        # Page views today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        views_today = await db.pageviews.count_documents({
            "timestamp": {"$gte": today_start}
        })
        
        # Page views this week
        week_start = datetime.utcnow() - timedelta(days=7)
        views_this_week = await db.pageviews.count_documents({
            "timestamp": {"$gte": week_start}
        })
        
        # Page views this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        views_this_month = await db.pageviews.count_documents({
            "timestamp": {"$gte": month_start}
        })
        
        # Unique visitors (by session) - optimized with time filter
        week_start = datetime.utcnow() - timedelta(days=7)
        unique_visitors = len(await db.pageviews.distinct("sessionId", {"timestamp": {"$gte": week_start}}))
        
        # Online users (active in last 5 minutes)
        online_threshold = datetime.utcnow() - timedelta(minutes=5)
        online_users = await db.online_users.count_documents({
            "lastActivity": {"$gte": online_threshold}
        })
        
        # Top pages
        pipeline = [
            {"$group": {"_id": "$page", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        top_pages = await db.pageviews.aggregate(pipeline).to_list(10)
        
        # Daily views for last 7 days
        daily_views = []
        for i in range(7):
            day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            count = await db.pageviews.count_documents({
                "timestamp": {"$gte": day_start, "$lt": day_end}
            })
            daily_views.insert(0, {
                "date": day_start.strftime("%Y-%m-%d"),
                "views": count
            })
        
        return {
            "totalViews": total_views,
            "viewsToday": views_today,
            "viewsThisWeek": views_this_week,
            "viewsThisMonth": views_this_month,
            "uniqueVisitors": unique_visitors,
            "onlineUsers": online_users,
            "topPages": top_pages,
            "dailyViews": daily_views
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/online-users", response_model=dict)
async def get_online_users(token_data: dict = Depends(verify_token)):
    """
    Get currently online users (admin only)
    """
    try:
        online_threshold = datetime.utcnow() - timedelta(minutes=5)
        cursor = db.online_users.find({
            "lastActivity": {"$gte": online_threshold}
        }).sort("lastActivity", -1)
        
        online_users = await cursor.to_list(100)
        
        for user in online_users:
            user["_id"] = str(user["_id"])
        
        return {
            "count": len(online_users),
            "users": online_users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/cleanup")
async def cleanup_old_data(token_data: dict = Depends(verify_token)):
    """
    Cleanup old analytics data (admin only)
    """
    try:
        # Remove page views older than 90 days
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        result1 = await db.pageviews.delete_many({
            "timestamp": {"$lt": cutoff_date}
        })
        
        # Remove inactive online users (older than 1 hour)
        inactive_threshold = datetime.utcnow() - timedelta(hours=1)
        result2 = await db.online_users.delete_many({
            "lastActivity": {"$lt": inactive_threshold}
        })
        
        return {
            "success": True,
            "deletedPageViews": result1.deleted_count,
            "deletedOnlineUsers": result2.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
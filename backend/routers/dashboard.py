from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.order import Order
from models.user import User
from schemas.dashboard import DashboardOut
from utils.dependencies import require_admin

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardOut)
def dashboard(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "total_orders": db.query(Order).count(),
        "pending_orders": db.query(Order).filter(Order.status == "Pending").count(),
        "delivered_orders": db.query(Order).filter(Order.status == "Delivered").count(),
    }

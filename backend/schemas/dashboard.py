from pydantic import BaseModel


class DashboardOut(BaseModel):
    total_users: int
    total_orders: int
    pending_orders: int
    delivered_orders: int

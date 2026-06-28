from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from schemas.food import FoodOut


class OrderItemOut(BaseModel):
    id: int
    food_id: int
    quantity: int
    price: Decimal
    food: FoodOut

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    created_at: datetime
    items: list[OrderItemOut]

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str

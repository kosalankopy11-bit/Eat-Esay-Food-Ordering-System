from pydantic import BaseModel, Field

from schemas.food import FoodOut


class CartCreate(BaseModel):
    food_id: int
    quantity: int = Field(default=1, ge=1)


class CartUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartOut(BaseModel):
    id: int
    user_id: int
    food_id: int
    quantity: int
    food: FoodOut

    model_config = {"from_attributes": True}

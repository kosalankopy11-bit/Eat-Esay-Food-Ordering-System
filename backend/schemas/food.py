from decimal import Decimal

from pydantic import BaseModel, Field


class FoodBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=80)
    price: Decimal = Field(gt=0)
    description: str | None = None
    image_url: str | None = None
    availability: bool = True


class FoodCreate(FoodBase):
    pass


class FoodUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    price: Decimal | None = Field(default=None, gt=0)
    description: str | None = None
    image_url: str | None = None
    availability: bool | None = None


class FoodOut(FoodBase):
    id: int

    model_config = {"from_attributes": True}

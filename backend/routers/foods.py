from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from starlette.datastructures import UploadFile

from database import get_db
from models.food import FoodItem
from schemas.food import FoodCreate, FoodOut, FoodUpdate
from utils.dependencies import require_admin
from utils.images import resolve_image_url

router = APIRouter(prefix="/foods", tags=["Foods"])


def _parse_availability(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return True
    return str(value).lower() in {"true", "1", "on"}


async def _parse_food_form(form) -> dict:
    image_field = form.get("image")
    image_file = image_field if isinstance(image_field, UploadFile) and image_field.filename else None
    image_url_raw = form.get("image_url")
    image_url = str(image_url_raw).strip() if image_url_raw else None

    return {
        "name": str(form.get("name", "")),
        "category": str(form.get("category", "")),
        "price": Decimal(str(form.get("price", "0"))),
        "description": form.get("description") or None,
        "availability": _parse_availability(form.get("availability")),
        "image": image_file,
        "image_url": image_url,
    }


@router.get("", response_model=list[FoodOut])
def list_foods(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(FoodItem)
    if search:
        query = query.filter(FoodItem.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(FoodItem.category == category)
    return query.order_by(FoodItem.name).all()


@router.get("/category/{category}", response_model=list[FoodOut])
def foods_by_category(category: str, db: Session = Depends(get_db)):
    return db.query(FoodItem).filter(FoodItem.category == category).order_by(FoodItem.name).all()


@router.get("/{food_id}", response_model=FoodOut)
def get_food(food_id: int, db: Session = Depends(get_db)):
    food = db.get(FoodItem, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    return food


@router.post("", response_model=FoodOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_food(request: Request, db: Session = Depends(get_db)):
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        payload = FoodCreate.model_validate(await request.json())
        if not payload.image_url:
            raise HTTPException(status_code=400, detail="image_url is required")
        food = FoodItem(
            name=payload.name,
            category=payload.category,
            price=payload.price,
            description=payload.description,
            availability=payload.availability,
            image_url=payload.image_url,
        )
    else:
        form = await request.form()
        data = await _parse_food_form(form)
        resolved_url = resolve_image_url(data["image"], data["image_url"], "foods", required=True)
        food = FoodItem(
            name=data["name"],
            category=data["category"],
            price=data["price"],
            description=data["description"],
            availability=data["availability"],
            image_url=resolved_url,
        )

    db.add(food)
    db.commit()
    db.refresh(food)
    return food


@router.put("/{food_id}", response_model=FoodOut, dependencies=[Depends(require_admin)])
async def update_food(food_id: int, request: Request, db: Session = Depends(get_db)):
    food = db.get(FoodItem, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        payload = FoodUpdate.model_validate(await request.json())
        if payload.name is not None:
            food.name = payload.name
        if payload.category is not None:
            food.category = payload.category
        if payload.price is not None:
            food.price = payload.price
        if payload.description is not None:
            food.description = payload.description
        if payload.availability is not None:
            food.availability = payload.availability
        if payload.image_url is not None:
            food.image_url = payload.image_url
    else:
        form = await request.form()
        data = await _parse_food_form(form)
        food.name = data["name"]
        food.category = data["category"]
        food.price = data["price"]
        food.description = data["description"]
        food.availability = data["availability"]
        resolved_url = resolve_image_url(data["image"], data["image_url"], "foods")
        if resolved_url is not None:
            food.image_url = resolved_url

    db.commit()
    db.refresh(food)
    return food


@router.delete("/{food_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_food(food_id: int, db: Session = Depends(get_db)):
    food = db.get(FoodItem, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    db.delete(food)
    db.commit()
    return None

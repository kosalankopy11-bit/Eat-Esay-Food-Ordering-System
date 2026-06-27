from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.cart import Cart
from models.food import FoodItem
from models.user import User
from schemas.cart import CartCreate, CartOut, CartUpdate
from utils.dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.post("", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_to_cart(payload: CartCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    food = db.get(FoodItem, payload.food_id)
    if not food or not food.availability:
        raise HTTPException(status_code=404, detail="Food item is unavailable")
    item = db.query(Cart).filter(Cart.user_id == current_user.id, Cart.food_id == payload.food_id).first()
    if item:
        item.quantity += payload.quantity
    else:
        item = Cart(user_id=current_user.id, food_id=payload.food_id, quantity=payload.quantity)
        db.add(item)
    db.commit()
    return db.query(Cart).options(joinedload(Cart.food)).filter(Cart.id == item.id).first()


@router.get("", response_model=list[CartOut])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Cart)
        .options(joinedload(Cart.food))
        .filter(Cart.user_id == current_user.id)
        .order_by(Cart.id.desc())
        .all()
    )


@router.put("/{cart_id}", response_model=CartOut)
def update_cart(
    cart_id: int,
    payload: CartUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(Cart).filter(Cart.id == cart_id, Cart.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    item.quantity = payload.quantity
    db.commit()
    return db.query(Cart).options(joinedload(Cart.food)).filter(Cart.id == item.id).first()


@router.delete("/{cart_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cart_item(cart_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Cart).filter(Cart.id == cart_id, Cart.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return None

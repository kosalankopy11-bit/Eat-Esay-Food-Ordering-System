from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.cart import Cart
from models.order import Order, OrderItem
from models.user import User
from schemas.order import OrderOut, OrderStatusUpdate
from utils.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

VALID_STATUSES = {"Pending", "Preparing", "Delivered", "Cancelled"}


def _order_query(db: Session):
    return db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.food))


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_items = (
        db.query(Cart)
        .options(joinedload(Cart.food))
        .filter(Cart.user_id == current_user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    unavailable = [item.food.name for item in cart_items if not item.food.availability]
    if unavailable:
        raise HTTPException(status_code=400, detail=f"Unavailable items: {', '.join(unavailable)}")

    order = Order(user_id=current_user.id, status="Pending")
    db.add(order)
    db.flush()
    for cart_item in cart_items:
        db.add(
            OrderItem(
                order_id=order.id,
                food_id=cart_item.food_id,
                quantity=cart_item.quantity,
                price=cart_item.food.price,
            )
        )
        db.delete(cart_item)
    db.commit()
    return _order_query(db).filter(Order.id == order.id).first()


@router.get("", response_model=list[OrderOut])
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = _order_query(db)
    if current_user.role != "admin":
        query = query.filter(Order.user_id == current_user.id)
    return query.order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = _order_query(db).filter(Order.id == order_id).first()
    if not order or (current_user.role != "admin" and order.user_id != current_user.id):
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=OrderOut)
def update_order(
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid order status")
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != "admin":
        if order.user_id != current_user.id or order.status != "Pending" or payload.status != "Cancelled":
            raise HTTPException(status_code=403, detail="Only pending orders can be cancelled")
    order.status = payload.status
    db.commit()
    return _order_query(db).filter(Order.id == order.id).first()


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order or (current_user.role != "admin" and order.user_id != current_user.id):
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != "admin" and order.status != "Pending":
        raise HTTPException(status_code=403, detail="Only pending orders can be cancelled")
    if current_user.role == "admin":
        db.delete(order)
    else:
        order.status = "Cancelled"
    db.commit()
    return None

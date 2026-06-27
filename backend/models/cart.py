from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


class Cart(Base):
    __tablename__ = "cart"
    __table_args__ = (UniqueConstraint("user_id", "food_id", name="uq_cart_user_food"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_id = Column(Integer, ForeignKey("food_items.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)

    user = relationship("User", back_populates="cart_items")
    food = relationship("FoodItem", back_populates="cart_items")

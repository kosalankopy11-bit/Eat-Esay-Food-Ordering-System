from sqlalchemy import Boolean, Column, DECIMAL, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), index=True, nullable=False)
    category = Column(String(80), index=True, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    availability = Column(Boolean, default=True, nullable=False)

    cart_items = relationship("Cart", back_populates="food", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="food")

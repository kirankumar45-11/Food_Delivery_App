from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    cuisine = Column(String(100), nullable=False)
    rating = Column(Float, nullable=False, default=4.5)
    delivery_time = Column(Integer, nullable=False, default=30)
    image = Column(String(500), nullable=False)

    # Establish one-to-many relationship with MenuItem
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(String(300), nullable=False)
    category = Column(String(100), nullable=True, default="Signature")
    price = Column(Float, nullable=False)
    image = Column(String(500), nullable=False)

    # Back relation to parent Restaurant
    restaurant = relationship("Restaurant", back_populates="menu_items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_email = Column(String(150), nullable=False)
    delivery_address = Column(String(300), nullable=False)
    payment_method = Column(String(50), nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(50), nullable=False, default="Pending")

    # One-to-many relationship with OrderItem
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    # Relation to parent Order
    order = relationship("Order", back_populates="items")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False, default="customer") # 'customer' or 'restaurant'




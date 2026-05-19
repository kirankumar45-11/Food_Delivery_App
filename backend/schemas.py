from pydantic import BaseModel
from typing import List

class MenuItemOut(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: str
    category: str
    price: float
    image: str

    class Config:
        from_attributes = True


class MenuItemCreate(BaseModel):
    restaurant_id: int
    name: str
    description: str = ""
    category: str = "Signature"
    price: float
    image: str = ""


class MenuItemUpdate(BaseModel):
    name: str = None
    description: str = None
    category: str = None
    price: float = None
    image: str = None


class RestaurantOut(BaseModel):
    id: int
    name: str
    cuisine: str
    rating: float
    delivery_time: int
    image: str

    class Config:
        from_attributes = True


class RestaurantDetailOut(BaseModel):
    id: int
    name: str
    cuisine: str
    rating: float
    delivery_time: int
    image: str
    menu_items: List[MenuItemOut]

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    name: str
    price: float
    quantity: int


class OrderCreate(BaseModel):
    customer_email: str
    delivery_address: str
    payment_method: str
    total_price: float
    items: List[OrderItemCreate]


class OrderItemOut(BaseModel):
    id: int
    name: str
    price: float
    quantity: int

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    customer_email: str
    delivery_address: str
    payment_method: str
    total_price: float
    status: str
    items: List[OrderItemOut]

    class Config:
        from_attributes = True


class UserRegister(BaseModel):
    email: str
    password: str
    fullName: str
    role: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut




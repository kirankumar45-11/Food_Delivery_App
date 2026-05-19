from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

from backend.database import get_db, init_db
from backend.models import Restaurant, MenuItem, Order, OrderItem, User
from backend.schemas import (
    RestaurantOut, RestaurantDetailOut, OrderCreate, OrderOut, 
    MenuItemOut, MenuItemCreate, MenuItemUpdate, UserRegister, UserLogin, UserOut, Token
)

# Trigger database auto-creation and seeding routines on startup
init_db()

app = FastAPI(title="BiteSwift Restaurant API", version="1.0.0")

security = HTTPBearer()

SECRET_KEY = "super_secret_biteswift_key_keep_it_safe"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token - Subject missing")
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired session token: {str(e)}")
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User associated with token not found")
    return user


@app.post("/api/auth/register", response_model=UserOut)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email.ilike(user_data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered")
        
    hashed = hash_password(user_data.password)
    db_user = User(
        email=user_data.email.lower(),
        password_hash=hashed,
        full_name=user_data.fullName,
        role=user_data.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/login", response_model=Token)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(login_data.email)).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token_data = {
        "sub": user.email,
        "role": user.role,
        "full_name": user.full_name
    }
    token = create_access_token(token_data)
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

# Set up CORS middleware to prevent local connection failures
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*" # Fallback catch-all for local network validation
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/restaurants", response_model=List[RestaurantOut])
def get_restaurants(db: Session = Depends(get_db)):
    """
    Fetch all active restaurant listings from the database.
    """
    restaurants = db.query(Restaurant).all()
    return restaurants

@app.get("/api/restaurants/{restaurant_id}", response_model=RestaurantDetailOut)
def get_restaurant_detail(restaurant_id: int, db: Session = Depends(get_db)):
    """
    Fetch details and full menu items for a specific restaurant.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@app.post("/api/orders", response_model=OrderOut, status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Submit a fresh gourmet customer order.
    """
    db_order = Order(
        customer_email=current_user.email,
        delivery_address=order_data.delivery_address,
        payment_method=order_data.payment_method,
        total_price=order_data.total_price,
        status="Pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Insert items
    for item in order_data.items:
        db_item = OrderItem(
            order_id=db_order.id,
            name=item.name,
            price=item.price,
            quantity=item.quantity
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order


@app.get("/api/orders", response_model=List[OrderOut])
def get_orders(customer_email: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch order logs, optionally filtering by customer email.
    """
    query = db.query(Order)
    if current_user.role == "customer":
        query = query.filter(Order.customer_email == current_user.email)
    elif customer_email:
        query = query.filter(Order.customer_email == customer_email)
    orders = query.all()
    return orders


@app.get("/api/restaurant/orders", response_model=List[OrderOut])
def get_restaurant_orders(restaurant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch all orders containing items from a specific restaurant.
    """
    if current_user.role != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied: Restaurant privileges required")
    # 1. Fetch menu item names for this restaurant
    menu_item_names = db.query(MenuItem.name).filter(MenuItem.restaurant_id == restaurant_id).all()
    names = [n[0] for n in menu_item_names]
    
    if not names:
        return []
        
    # 2. Find orders containing any of these menu item names
    orders = db.query(Order).join(Order.items).filter(OrderItem.name.in_(names)).distinct().all()
    return orders


@app.put("/api/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update the status of an existing order.
    """
    if current_user.role != "restaurant":
        raise HTTPException(status_code=403, detail="Access denied: Restaurant privileges required")
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order


@app.get("/api/orders/{order_id}", response_model=OrderOut)
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    """
    Fetch a specific customer order by its ID.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order




@app.get("/api/restaurants/chef/{chef_name}", response_model=RestaurantDetailOut)
def get_restaurant_by_chef(chef_name: str, db: Session = Depends(get_db)):
    """
    Fetch or auto-create a restaurant associated with a chef/owner.
    """
    # 1. Handle special mapping for built-in demo chef
    if chef_name == "Chef Gusteau" or chef_name == "chef@biteswift.com":
        restaurant = db.query(Restaurant).filter(Restaurant.id == 1).first()
        if restaurant:
            return restaurant

    # 2. Check if a restaurant containing this chef's name already exists in the database
    kitchen_name = f"{chef_name}'s Kitchen"
    restaurant = db.query(Restaurant).filter(Restaurant.name == kitchen_name).first()
    
    if not restaurant:
        # Create a new premium restaurant record for this chef
        restaurant = Restaurant(
            name=kitchen_name,
            cuisine="Gourmet Fusion",
            rating=4.8,
            delivery_time=25,
            image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80"
        )
        db.add(restaurant)
        db.commit()
        db.refresh(restaurant)
    
    return restaurant


@app.post("/api/menu-items", response_model=MenuItemOut, status_code=201)
def create_menu_item(item_data: MenuItemCreate, db: Session = Depends(get_db)):
    """
    Add a new gourmet menu item for a restaurant.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == item_data.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    image_url = item_data.image.strip()
    if not image_url:
        image_url = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"
        
    db_item = MenuItem(
        restaurant_id=item_data.restaurant_id,
        name=item_data.name,
        price=item_data.price,
        category=item_data.category or "Signature",
        description=item_data.description or "Freshly prepared house specialty.",
        image=image_url
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.put("/api/menu-items/{item_id}", response_model=MenuItemOut)
def update_menu_item(item_id: int, item_data: MenuItemUpdate, db: Session = Depends(get_db)):
    """
    Edit an existing menu item.
    """
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    if item_data.name is not None:
        db_item.name = item_data.name
    if item_data.price is not None:
        db_item.price = item_data.price
    if item_data.category is not None:
        db_item.category = item_data.category
    if item_data.description is not None:
        db_item.description = item_data.description
    if item_data.image is not None:
        if item_data.image.strip():
            db_item.image = item_data.image
            
    db.commit()
    db.refresh(db_item)
    return db_item


@app.delete("/api/menu-items/{item_id}", status_code=200)
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    """
    Delete a menu item.
    """
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}


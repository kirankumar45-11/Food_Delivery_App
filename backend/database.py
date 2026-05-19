import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, Restaurant, MenuItem, User

# Default MySQL connection configurations
MYSQL_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root@localhost/biteswift")
SQLITE_URL = "sqlite:///./biteswift.db"

engine = None
SessionLocal = None

# Pre-verify MySQL existence and create database 'biteswift' if missing
try:
    import pymysql
    temp_conn = pymysql.connect(host="localhost", user="root", password="", connect_timeout=2)
    try:
        with temp_conn.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS biteswift")
            print("Verified/Created MySQL database 'biteswift' successfully!", flush=True)
    finally:
        temp_conn.close()
except Exception as e:
    print(f"Local MySQL pre-check notice: {e} (Attempting standard startup...)", flush=True)

try:
    print(f"Attempting connection to MySQL: {MYSQL_URL}", flush=True)
    # Set a short connection timeout so the app doesn't hang if MySQL is offline
    engine = create_engine(MYSQL_URL, connect_args={"connect_timeout": 2})
    # Proactively test connection
    with engine.connect() as conn:
        print("Successfully connected to MySQL database engine!", flush=True)
except Exception as e:
    print(f"MySQL connection failed: {e}", flush=True)
    print("Falling back to local zero-config SQLite database...", flush=True)
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False} if "sqlite" in SQLITE_URL else {})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auto-seed Database with initial 6 premium restaurants if empty
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            # Seed default demo accounts
            if db.query(User).count() == 0:
                print("Seeding initial demo accounts...", flush=True)
                import bcrypt
                
                def get_seed_hash(password: str) -> str:
                    salt = bcrypt.gensalt()
                    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
                    
                demo_users = [
                    User(
                        email="customer@biteswift.com",
                        password_hash=get_seed_hash("password"),
                        full_name="Alice Smith",
                        role="customer"
                    ),
                    User(
                        email="chef@biteswift.com",
                        password_hash=get_seed_hash("password"),
                        full_name="Chef Gusteau",
                        role="restaurant"
                    )
                ]
                db.add_all(demo_users)
                db.commit()
                print("Seeding complete! 2 demo users added to users table.", flush=True)

            if db.query(Restaurant).count() == 0:
                print("Database tables created. Seeding initial 6 restaurants...", flush=True)
                mock_restaurants = [
                    Restaurant(
                        name="La Maison Parisienne",
                        cuisine="Gourmet French",
                        rating=4.9,
                        delivery_time=30,
                        image="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"
                    ),
                    Restaurant(
                        name="Pizzeria Bellina",
                        cuisine="Artisan Italian",
                        rating=4.8,
                        delivery_time=20,
                        image="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80"
                    ),
                    Restaurant(
                        name="Sakura Culinary",
                        cuisine="Authentic Japanese",
                        rating=4.9,
                        delivery_time=25,
                        image="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80"
                    ),
                    Restaurant(
                        name="Burger & Co.",
                        cuisine="American Bistro",
                        rating=4.7,
                        delivery_time=15,
                        image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
                    ),
                    Restaurant(
                        name="El Taco Loco",
                        cuisine="Vibrant Mexican",
                        rating=4.6,
                        delivery_time=20,
                        image="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80"
                    ),
                    Restaurant(
                        name="Tikka Express",
                        cuisine="Rich Indian",
                        rating=4.8,
                        delivery_time=30,
                        image="https://images.unsplash.com/photo-1585938338392-50a5d22b143b?auto=format&fit=crop&w=500&q=80"
                    )
                ]
                db.add_all(mock_restaurants)
                db.commit()
                print("Seeding complete! 6 premium restaurants added to table.", flush=True)

            # Check if MenuItem table is empty and seed dishes
            if db.query(MenuItem).count() == 0:
                print("Seeding signature menu dishes...", flush=True)
                la_maison = db.query(Restaurant).filter_by(name="La Maison Parisienne").first()
                pizzeria = db.query(Restaurant).filter_by(name="Pizzeria Bellina").first()
                sakura = db.query(Restaurant).filter_by(name="Sakura Culinary").first()
                burger = db.query(Restaurant).filter_by(name="Burger & Co.").first()
                taco = db.query(Restaurant).filter_by(name="El Taco Loco").first()
                tikka = db.query(Restaurant).filter_by(name="Tikka Express").first()
                
                dishes = []
                if la_maison:
                    dishes.extend([
                        MenuItem(
                            restaurant_id=la_maison.id,
                            name="Coq au Vin",
                            description="Slow-braised chicken in rich red burgundy wine with pearl onions and mushrooms.",
                            price=28.50,
                            image="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=la_maison.id,
                            name="Herb Butter Grilled Steak",
                            description="Char-grilled prime ribeye steak basted in melted house garlic herb butter.",
                            price=34.50,
                            image="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=la_maison.id,
                            name="Decadent Chocolate Lava Fondant",
                            description="Warm chocolate cake with an irresistible molten chocolate lava core.",
                            price=9.50,
                            image="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80"
                        )
                    ])
                if pizzeria:
                    dishes.extend([
                        MenuItem(
                            restaurant_id=pizzeria.id,
                            name="Artisan Pepperoni & Honey Pizza",
                            description="Spicy pepperoni, fresh mozzarella, and a hot honey drizzle on sourdough.",
                            price=18.50,
                            image="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=pizzeria.id,
                            name="Creamy Truffle Fettuccine",
                            description="Rich black truffle mushroom cream sauce tossed with hand-rolled fettuccine pasta.",
                            price=21.00,
                            image="https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=pizzeria.id,
                            name="Classic Italian Tiramisu",
                            description="Layers of espresso-soaked ladyfingers and whipped cocoa mascarpone cream.",
                            price=8.50,
                            image="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80"
                        )
                    ])
                if sakura:
                    dishes.extend([
                        MenuItem(
                            restaurant_id=sakura.id,
                            name="Imperial Dragon Sushi Platter",
                            description="Premium selection of spicy tuna, salmon maki roll, and chef's daily nigiri.",
                            price=24.00,
                            image="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=sakura.id,
                            name="Rich Pork Tonkotsu Ramen",
                            description="Traditional 12-hour simmered pork broth, chashu pork belly, soft egg, and bamboo shoots.",
                            price=19.50,
                            image="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=sakura.id,
                            name="Matcha Mochi Cakes",
                            description="Delicate green tea rice flour shells enclosing sweet whipped cream fillings.",
                            price=7.00,
                            image="https://images.unsplash.com/photo-1582716401301-b2407dc7563d?auto=format&fit=crop&w=500&q=80"
                        )
                    ])
                if burger:
                    dishes.extend([
                        MenuItem(
                            restaurant_id=burger.id,
                            name="Truffle Bacon Double Cheeseburger",
                            description="Double smash angus patties, crispy hickory bacon, cheddar, and truffle aioli.",
                            price=15.99,
                            image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=burger.id,
                            name="Spicy Buffalo Cauliflower Wings",
                            description="Crisp buttermilk battered florets tossed in hot honey buffalo glaze.",
                            price=11.50,
                            image="https://images.unsplash.com/photo-1562967962-e429381640a3?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=burger.id,
                            name="Sea Salt Caramel Milkshake",
                            description="Velvety hand-spun vanilla ice cream infused with rich dark caramel sauce.",
                            price=6.50,
                            image="https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80"
                        )
                    ])
                if taco:
                    dishes.extend([
                        MenuItem(
                            restaurant_id=taco.id,
                            name="Crispy Barbacoa Beef Tacos",
                            description="Three double-corn tortillas loaded with slow-cooked beef, white onions, and cilantro.",
                            price=13.50,
                            image="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=taco.id,
                            name="Loaded Chipotle Quesadilla",
                            description="Griddled large flour tortilla loaded with roasted chicken, sweet peppers, and chipotle cream.",
                            price=14.00,
                            image="https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=taco.id,
                            name="Cinnamon Sugar Churros",
                            description="Crispy fried pastries rolled in cinnamon sugar with warm dark chocolate dip.",
                            price=6.50,
                            image="https://images.unsplash.com/photo-1561626423-a51b45aef0a1?auto=format&fit=crop&w=500&q=80"
                        )
                    ])
                if tikka:
                    dishes.extend([
                        MenuItem(
                            restaurant_id=tikka.id,
                            name="Creamy Butter Chicken",
                            description="Tender tandoori grilled chicken thighs simmered in spiced tomato butter gravy.",
                            price=18.00,
                            image="https://images.unsplash.com/photo-1585938338392-50a5d22b143b?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=tikka.id,
                            name="Garlic Butter Naan Basket",
                            description="Fresh flatbreads baked inside clay oven tandoor brushed in garlic butter.",
                            price=5.00,
                            image="https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80"
                        ),
                        MenuItem(
                            restaurant_id=tikka.id,
                            name="Cardamom Mango Lassi",
                            description="Traditional blended sweet yogurt cooler flavored with ripe alphonso mango pulp.",
                            price=4.50,
                            image="https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80"
                        )
                    ])
                db.add_all(dishes)
                db.commit()
                print("Seeding complete! 18 dynamic signature dishes added to menu_items.", flush=True)

        finally:
            db.close()
    except Exception as err:
        print(f"Database initialization or seeding error: {err}", flush=True)


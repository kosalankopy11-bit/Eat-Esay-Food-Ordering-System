from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from database import Base, SessionLocal, engine, settings
from models import Cart, FoodItem, Order, OrderItem, User  # noqa: F401
from routers import auth, cart, dashboard, foods, orders
from utils.security import hash_password

Base.metadata.create_all(bind=engine)

DEFAULT_ADMIN_EMAIL = "sayan@gmail.com"
DEFAULT_ADMIN_PASSWORD = "TS200506"


def ensure_database_columns():
    inspector = inspect(engine)
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "profile_image_url" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500) NULL"))


def create_default_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == DEFAULT_ADMIN_EMAIL).first()
        if not admin:
            username = "sayan"
            if db.query(User).filter(User.username == username).first():
                username = "sayan_admin"
            admin = User(
                username=username,
                email=DEFAULT_ADMIN_EMAIL,
                password=hash_password(DEFAULT_ADMIN_PASSWORD),
                role="admin",
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


ensure_database_columns()
create_default_admin()

app = FastAPI(title="Food Ordering System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(foods.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Food Ordering System API is running"}

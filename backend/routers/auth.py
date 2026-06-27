from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from starlette.datastructures import UploadFile as StarletteUploadFile

from database import get_db
from models.user import User
from schemas.user import ProfileImageUpdate, Token, UserCreate, UserLogin, UserOut
from utils.dependencies import get_current_user
from utils.images import resolve_image_url
from utils.security import create_access_token, hash_password, verify_password

router = APIRouter(tags=["Auth"])
DEFAULT_ADMIN_EMAIL = "sayan@gmail.com"


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(or_(User.email == payload.email, User.username == payload.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    user = User(
        username=payload.username,
        email=payload.email,
        password=hash_password(payload.password),
        role="customer",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user.role == "admin" and user.email != DEFAULT_ADMIN_EMAIL:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(str(user.id), {"role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/profile", response_model=UserOut)
def profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/profile/image", response_model=UserOut)
async def upload_profile_image(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        payload = ProfileImageUpdate.model_validate(await request.json())
        current_user.profile_image_url = payload.image_url
    else:
        form = await request.form()
        image_field = form.get("image")
        image_file = image_field if isinstance(image_field, StarletteUploadFile) and image_field.filename else None
        image_url_raw = form.get("image_url")
        image_url = str(image_url_raw).strip() if image_url_raw else None

        if image_file is None and not image_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either an image file or an image URL is required",
            )

        current_user.profile_image_url = resolve_image_url(
            image_file,
            image_url,
            "profiles",
            required=True,
        )

    db.commit()
    db.refresh(current_user)
    return current_user

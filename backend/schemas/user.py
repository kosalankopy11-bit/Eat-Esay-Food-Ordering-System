from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: int
    role: str
    profile_image_url: str | None = None

    model_config = {"from_attributes": True}


class ProfileImageUpdate(BaseModel):
    image_url: str = Field(min_length=1, max_length=500)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

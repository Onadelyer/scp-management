from pydantic import BaseModel, Field, validator
from typing import Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: str = Field(
        ...,
        pattern="^(Security Personnel|Mobile Task Forces|Administrative Personnel)$"
    )
    secret_token: Optional[str] = None  # Only required for Administrative Personnel

    @validator('role')
    def validate_role(cls, v):
        valid_roles = ["Security Personnel", "Mobile Task Forces", "Administrative Personnel"]
        if v not in valid_roles:
            raise ValueError('Invalid role')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    password: Optional[str]
    role: Optional[str] = Field(
        None,
        pattern="^(Security Personnel|Mobile Task Forces|Administrative Personnel)$"
    )

    @validator('role')
    def validate_role(cls, v):
        if v is None:
            return v
        valid_roles = ["Security Personnel", "Mobile Task Forces", "Administrative Personnel"]
        if v not in valid_roles:
            raise ValueError('Invalid role')
        return v

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool

    class Config:
        orm_mode = True  # Valid in Pydantic 1.x

class UserListResponse(BaseModel):
    users: list[UserResponse]

class UserDeleteResponse(BaseModel):
    detail: str

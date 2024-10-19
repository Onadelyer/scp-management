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

class UserProfile(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool

    class Config:
        orm_mode = True

class UserProfileUpdate(BaseModel):
    username: Optional[str]
    password: Optional[str]

    @validator('username')
    def validate_username(cls, v):
        if not v:
            raise ValueError('Username cannot be empty')
        return v

    @validator('password')
    def validate_password(cls, v):
        if not v:
            raise ValueError('Password cannot be empty')
        return v
    
class StorageChamberBase(BaseModel):
    name: str
    chamber_type: str
    occupancy_status: Optional[str] = 'Vacant'
    condition: Optional[str] = 'Operational'
    location: str
    capacity: int
    special_requirements: Optional[str] = None

    @validator('occupancy_status')
    def validate_occupancy_status(cls, v):
        valid_statuses = ['Occupied', 'Partially Occupied', 'Vacant']
        if v not in valid_statuses:
            raise ValueError('Invalid occupancy status')
        return v

    @validator('condition')
    def validate_condition(cls, v):
        valid_conditions = ['Operational', 'Under Maintenance', 'Needs Repair']
        if v not in valid_conditions:
            raise ValueError('Invalid condition')
        return v

class StorageChamberCreate(StorageChamberBase):
    pass

class StorageChamberUpdate(BaseModel):
    name: Optional[str]
    chamber_type: Optional[str]
    occupancy_status: Optional[str]
    condition: Optional[str]
    location: Optional[str]
    capacity: Optional[int]
    special_requirements: Optional[str]

    @validator('occupancy_status')
    def validate_occupancy_status(cls, v):
        if v is None:
            return v
        valid_statuses = ['Occupied', 'Partially Occupied', 'Vacant']
        if v not in valid_statuses:
            raise ValueError('Invalid occupancy status')
        return v

    @validator('condition')
    def validate_condition(cls, v):
        if v is None:
            return v
        valid_conditions = ['Operational', 'Under Maintenance', 'Needs Repair']
        if v not in valid_conditions:
            raise ValueError('Invalid condition')
        return v

class StorageChamber(StorageChamberBase):
    id: int

    class Config:
        orm_mode = True
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
SECRET_REGISTRATION_TOKEN = "super_secret_token"  # Define your secret token here

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter()

# Utility Functions

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        username=user.username, 
        hashed_password=hashed_password,
        role=user.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if user and verify_password(password, user.hashed_password):
        return user
    return None

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Default expiration time of 15 minutes
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_username(db, username)
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def get_current_active_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "Administrative Personnel":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

# API Routes

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.role == "Administrative Personnel":
        if user.secret_token != SECRET_REGISTRATION_TOKEN:
            raise HTTPException(status_code=400, detail="Invalid secret token")
    else:
        # For other roles, ensure only admins can create them
        raise HTTPException(status_code=400, detail="Cannot register this role directly")
    db_user = get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = create_user(db, user)
    return new_user

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    authenticated_user = authenticate_user(db, user.username, user.password)
    if not authenticated_user or not authenticated_user.is_active:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": authenticated_user.username},
        expires_delta=access_token_expires
    )
    user_role = authenticated_user.role
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_role": user_role
    }

@router.get("/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_admin)):
    users = db.query(models.User).all()
    return users

@router.post("/users", response_model=schemas.UserResponse)
def create_new_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_admin)):
    db_user = get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    # Only admin can create any user
    new_user = create_user(db, user)
    return new_user

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_admin)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.password:
        db_user.hashed_password = get_password_hash(user.password)
    if user.role:
        db_user.role = user.role
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}", response_model=schemas.UserDeleteResponse)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_admin)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"detail": "User deleted successfully"}

@router.post("/users/{user_id}/deactivate", response_model=schemas.UserResponse)
def deactivate_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_admin)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.is_active = False
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/users/{user_id}/activate", response_model=schemas.UserResponse)
def activate_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_admin)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.is_active = True
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/profile", response_model=schemas.UserProfile)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserProfile)
def update_profile(
    profile_data: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if profile_data.username:
        # Check if the new username is already taken
        user_with_same_username = db.query(models.User).filter(models.User.username == profile_data.username).first()
        if user_with_same_username and user_with_same_username.id != current_user.id:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = profile_data.username
    if profile_data.password:
        current_user.hashed_password = get_password_hash(profile_data.password)
    db.commit()
    db.refresh(current_user)
    return current_user
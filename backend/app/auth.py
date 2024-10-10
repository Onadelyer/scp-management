from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()

# API Routes

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = create_user(db, user)
    return new_user

@router.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    authenticated_user = authenticate_user(db, user.username, user.password)
    if not authenticated_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": authenticated_user.username},
        expires_delta=access_token_expires
    )
    user_role = 'admin' if authenticated_user.is_admin else 'user'
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_role": user_role
    }


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
        hashed_password=hashed_password
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


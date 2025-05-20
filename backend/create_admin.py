"""
Script to create an initial admin user in the SCP Management System.
Run this script to create the first admin user which can then be used to create others.
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, User
from app.auth import get_password_hash, SECRET_REGISTRATION_TOKEN

# Use the database URL from environment if available, otherwise use SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./scp.db")

def create_admin_user(username, password, email):
    """Create an administrative user in the database."""
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        print(f"User '{username}' already exists!")
        return
    
    # Create the admin user
    hashed_password = get_password_hash(password)
    admin_user = User(
        username=username,
        hashed_password=hashed_password,
        email=email,
        role="Administrative Personnel",
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    print(f"Admin user '{username}' created successfully!")
    
if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_admin.py <username> <password> <email>")
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    email = sys.argv[3]
    
    create_admin_user(username, password, email)
    
    print("\nSecret registration token for creating additional admin users:")
    print(f"SECRET_REGISTRATION_TOKEN: {SECRET_REGISTRATION_TOKEN}") 
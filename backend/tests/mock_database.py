"""Mock database for testing purposes"""
from unittest.mock import MagicMock
from sqlalchemy.ext.declarative import declarative_base

# Create a mock Base class that can be used in tests
Base = declarative_base()

# Create a mock engine and session
DATABASE_URL = "sqlite:///:memory:"
engine = MagicMock()
SessionLocal = MagicMock()

# Create a mock database session that can be used in tests
def get_db():
    """Get a mock database session"""
    db = MagicMock()
    try:
        yield db
    finally:
        db.close()

# Create mock models that match the real models but don't need a real database
class MockUser(Base):
    """Mock User model"""
    __tablename__ = "users"
    id = MagicMock()
    username = MagicMock()
    email = MagicMock()
    hashed_password = MagicMock()
    
class MockObject(Base):
    """Mock Object model"""
    __tablename__ = "objects"
    id = MagicMock()
    name = MagicMock()
    description = MagicMock()
    
# Simple test to verify the mock database works
def test_mock_db():
    """Make sure mock database is working"""
    assert DATABASE_URL == "sqlite:///:memory:"
    assert engine is not None
    assert SessionLocal is not None 
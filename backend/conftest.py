import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Add app directory to path if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock the database and app before importing
@pytest.fixture(scope="session", autouse=True)
def mock_db():
    """Mock database connection for all tests"""
    with patch("sqlalchemy.create_engine") as mock_engine:
        # Return a mock engine
        mock_engine.return_value = MagicMock()
        yield mock_engine

@pytest.fixture
def app():
    """Create a test app with mocked database"""
    with patch("app.database.engine"), \
         patch("app.database.Base.metadata.create_all"), \
         patch("app.database.DATABASE_URL", "sqlite:///:memory:"):
        from app.main import app
        return app

@pytest.fixture
def client(app):
    """
    Create a test client for the app
    """
    from fastapi.testclient import TestClient
    return TestClient(app) 
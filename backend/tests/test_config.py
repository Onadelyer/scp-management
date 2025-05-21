"""Test configuration module to override database settings"""
from unittest.mock import MagicMock

# Create mock objects to replace actual database objects
mock_engine = MagicMock()
mock_session_maker = MagicMock()
mock_session = MagicMock()

# Create a mock database session that can be used in tests
def get_mock_db():
    """Get a mock database session"""
    yield mock_session

# Simple test to verify the configuration works
def test_config():
    """Make sure test configuration is working"""
    assert mock_engine is not None
    assert mock_session_maker is not None
    assert mock_session is not None 
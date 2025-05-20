import pytest
from fastapi import status
from app.schemas import UserCreate

def test_register_user(client):
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword",
        "role": "Security Personnel"
    }
    response = client.post("/register", json=user_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]
    assert "password" not in data  # Password should not be returned

def test_login_user(client):
    # First register a user
    user_data = {
        "username": "loginuser",
        "email": "login@example.com",
        "password": "loginpassword",
        "role": "Security Personnel"
    }
    client.post("/register", json=user_data)
    
    # Then attempt to login
    login_data = {
        "username": "loginuser",
        "password": "loginpassword"
    }
    response = client.post("/token", data=login_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    login_data = {
        "username": "nonexistentuser",
        "password": "wrongpassword"
    }
    response = client.post("/token", data=login_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user(client):
    # Register and login a user first
    user_data = {
        "username": "currentuser",
        "email": "current@example.com",
        "password": "currentpassword",
        "role": "Security Personnel"
    }
    client.post("/register", json=user_data)
    
    login_data = {
        "username": "currentuser",
        "password": "currentpassword"
    }
    login_response = client.post("/token", data=login_data)
    access_token = login_response.json()["access_token"]
    
    # Get current user with token
    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"] 
import pytest
from fastapi import status
from app.schemas import UserCreate
from app.auth import SECRET_REGISTRATION_TOKEN

def test_register_admin_user(client):
    user_data = {
        "username": "testadmin",
        "email": "admin@example.com",
        "password": "testpassword",
        "role": "Administrative Personnel",
        "secret_token": SECRET_REGISTRATION_TOKEN
    }
    response = client.post("/register", json=user_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == user_data["username"]
    assert "password" not in data  # Password should not be returned

def test_register_invalid_role(client):
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword",
        "role": "Security Personnel"
    }
    response = client.post("/register", json=user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Cannot register this role directly" in response.json()["detail"]

def test_login_user(client):
    # First register an admin user
    user_data = {
        "username": "loginadmin",
        "email": "login@example.com",
        "password": "loginpassword",
        "role": "Administrative Personnel",
        "secret_token": SECRET_REGISTRATION_TOKEN
    }
    client.post("/register", json=user_data)
    
    # Then attempt to login
    login_data = {
        "username": "loginadmin",
        "password": "loginpassword"
    }
    response = client.post("/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user_role"] == "Administrative Personnel"

def test_login_invalid_credentials(client):
    login_data = {
        "username": "nonexistentuser",
        "password": "wrongpassword"
    }
    response = client.post("/login", json=login_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid credentials" in response.json()["detail"]

def test_get_current_user_profile(client):
    # Register and login a user first
    user_data = {
        "username": "profileuser",
        "email": "profile@example.com",
        "password": "profilepass",
        "role": "Administrative Personnel",
        "secret_token": SECRET_REGISTRATION_TOKEN
    }
    client.post("/register", json=user_data)
    
    login_data = {
        "username": "profileuser",
        "password": "profilepass"
    }
    login_response = client.post("/login", json=login_data)
    access_token = login_response.json()["access_token"]
    
    # Get current user profile with token
    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.get("/profile", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == user_data["username"] 
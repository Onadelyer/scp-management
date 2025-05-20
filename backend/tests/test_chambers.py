import pytest
from fastapi import status

def test_create_chamber(client):
    # First create a user and login
    user_data = {
        "username": "chamberuser",
        "email": "chamber@example.com",
        "password": "chamberpassword",
        "role": "Administrative Personnel"  # Only admin can create chambers
    }
    client.post("/register", json=user_data)
    
    login_data = {
        "username": "chamberuser",
        "password": "chamberpassword"
    }
    login_response = client.post("/token", data=login_data)
    access_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Create a storage chamber
    chamber_data = {
        "name": "Test Chamber",
        "location": "Sector 7",
        "security_level": "High",
        "capacity": 100,
        "description": "A test chamber for storing test objects"
    }
    
    response = client.post("/chambers/", json=chamber_data, headers=headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == chamber_data["name"]
    assert data["location"] == chamber_data["location"]
    assert "id" in data

def test_get_chambers(client):
    # First create a user and login
    user_data = {
        "username": "getchamberuser",
        "email": "getchamber@example.com",
        "password": "getchamberpassword",
        "role": "Security Personnel"
    }
    client.post("/register", json=user_data)
    
    login_data = {
        "username": "getchamberuser",
        "password": "getchamberpassword"
    }
    login_response = client.post("/token", data=login_data)
    access_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Create an admin user to create chambers
    admin_data = {
        "username": "adminuser",
        "email": "admin@example.com",
        "password": "adminpassword",
        "role": "Administrative Personnel"
    }
    client.post("/register", json=admin_data)
    
    admin_login = {
        "username": "adminuser",
        "password": "adminpassword"
    }
    admin_response = client.post("/token", data=admin_login)
    admin_token = admin_response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create two storage chambers
    chamber_data1 = {
        "name": "First Chamber",
        "location": "Area 1",
        "security_level": "Medium",
        "capacity": 50,
        "description": "First test chamber"
    }
    
    chamber_data2 = {
        "name": "Second Chamber",
        "location": "Area 2",
        "security_level": "Low",
        "capacity": 30,
        "description": "Second test chamber"
    }
    
    client.post("/chambers/", json=chamber_data1, headers=admin_headers)
    client.post("/chambers/", json=chamber_data2, headers=admin_headers)
    
    # Get all chambers as regular user
    response = client.get("/chambers/", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 2  # Should have at least the two chambers we created

def test_get_single_chamber(client):
    # Create admin user for chamber creation
    admin_data = {
        "username": "singleadmin",
        "email": "singleadmin@example.com",
        "password": "singleadminpass",
        "role": "Administrative Personnel"
    }
    client.post("/register", json=admin_data)
    
    admin_login = {
        "username": "singleadmin",
        "password": "singleadminpass"
    }
    admin_response = client.post("/token", data=admin_login)
    admin_token = admin_response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create a chamber
    chamber_data = {
        "name": "Single Chamber",
        "location": "Zone X",
        "security_level": "High",
        "capacity": 75,
        "description": "Chamber for single test"
    }
    
    create_response = client.post("/chambers/", json=chamber_data, headers=admin_headers)
    chamber_id = create_response.json()["id"]
    
    # Get the chamber
    response = client.get(f"/chambers/{chamber_id}", headers=admin_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == chamber_id
    assert data["name"] == chamber_data["name"] 
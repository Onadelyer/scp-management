from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .database import get_db
from .auth import get_current_user, get_current_active_admin

router = APIRouter(
    prefix="/storage-chambers",
    tags=["storage-chambers"] 
)

# Get all storage chambers
@router.get("/", response_model=List[schemas.StorageChamber])
def get_storage_chambers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    chambers = db.query(models.StorageChamber).offset(skip).limit(limit).all()
    return chambers

# Get a specific storage chamber
@router.get("/{chamber_id}", response_model=schemas.StorageChamber)
def get_storage_chamber(
    chamber_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    chamber = db.query(models.StorageChamber).filter(models.StorageChamber.id == chamber_id).first()
    if not chamber:
        raise HTTPException(status_code=404, detail="Storage chamber not found")
    return chamber

# Create a new storage chamber
@router.post("/", response_model=schemas.StorageChamber)
def create_storage_chamber(
    chamber: schemas.StorageChamberCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    existing_chamber = db.query(models.StorageChamber).filter(models.StorageChamber.name == chamber.name).first()
    if existing_chamber:
        raise HTTPException(status_code=400, detail="Storage chamber with this name already exists")
    new_chamber = models.StorageChamber(**chamber.dict())
    db.add(new_chamber)
    db.commit()
    db.refresh(new_chamber)
    return new_chamber

# Update a storage chamber
@router.put("/{chamber_id}", response_model=schemas.StorageChamber)
def update_storage_chamber(
    chamber_id: int,
    chamber_data: schemas.StorageChamberUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    chamber = db.query(models.StorageChamber).filter(models.StorageChamber.id == chamber_id).first()
    if not chamber:
        raise HTTPException(status_code=404, detail="Storage chamber not found")
    for key, value in chamber_data.dict(exclude_unset=True).items():
        setattr(chamber, key, value)
    db.commit()
    db.refresh(chamber)
    return chamber

# Delete a storage chamber
@router.delete("/{chamber_id}", response_model=schemas.StorageChamber)
def delete_storage_chamber(
    chamber_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    chamber = db.query(models.StorageChamber).filter(models.StorageChamber.id == chamber_id).first()
    if not chamber:
        raise HTTPException(status_code=404, detail="Storage chamber not found")
    db.delete(chamber)
    db.commit()
    return chamber

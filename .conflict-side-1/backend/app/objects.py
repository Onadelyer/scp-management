from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .database import get_db
from .auth import get_current_user, get_current_active_admin

router = APIRouter(
    prefix="/objects",
    tags=["objects"]
)

# Get all objects
@router.get("", response_model=List[schemas.Object])
def get_objects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    objects = db.query(models.Object).offset(skip).limit(limit).all()
    return objects

# Get a specific object
@router.get("/{object_id}", response_model=schemas.Object)
def get_object(
    object_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    obj = db.query(models.Object).filter(models.Object.id == object_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj

# Create a new object
@router.post("", response_model=schemas.Object)
def create_object(
    obj: schemas.ObjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    existing_object = db.query(models.Object).filter(models.Object.identifier == obj.identifier).first()
    if existing_object:
        raise HTTPException(status_code=400, detail="Object with this identifier already exists")
    new_object = models.Object(**obj.dict())
    db.add(new_object)
    db.commit()
    db.refresh(new_object)
    return new_object

# Update an object
@router.put("/{object_id}", response_model=schemas.Object)
def update_object(
    object_id: int,
    obj_data: schemas.ObjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    obj = db.query(models.Object).filter(models.Object.id == object_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    # If assigning to a storage chamber, check if the chamber exists
    if obj_data.storage_chamber_id is not None:
        chamber = db.query(models.StorageChamber).filter(models.StorageChamber.id == obj_data.storage_chamber_id).first()
        if not chamber:
            raise HTTPException(status_code=404, detail="Storage chamber not found")
        # Assign object to chamber
        obj.storage_chamber_id = obj_data.storage_chamber_id
        # Update occupancy status
        update_chamber_occupancy_status(chamber, db)
    else:
        # If removing assignment
        if obj.storage_chamber_id is not None:
            previous_chamber = db.query(models.StorageChamber).filter(models.StorageChamber.id == obj.storage_chamber_id).first()
            obj.storage_chamber_id = None
            # Update occupancy status of the previous chamber
            update_chamber_occupancy_status(previous_chamber, db)
    # Update other fields
    for key, value in obj_data.dict(exclude_unset=True, exclude={'storage_chamber_id'}).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

def update_chamber_occupancy_status(chamber: models.StorageChamber, db: Session):
    total_objects = db.query(models.Object).filter(models.Object.storage_chamber_id == chamber.id).count()
    if total_objects == 0:
        chamber.occupancy_status = 'Vacant'
    elif total_objects < chamber.capacity:
        chamber.occupancy_status = 'Partially Occupied'
    else:
        chamber.occupancy_status = 'Occupied'
    db.commit()
    db.refresh(chamber)

# Delete an object
@router.delete("/{object_id}", response_model=schemas.Object)
def delete_object(
    object_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    obj = db.query(models.Object).filter(models.Object.id == object_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    db.delete(obj)
    db.commit()
    return obj

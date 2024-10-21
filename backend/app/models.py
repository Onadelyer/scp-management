from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship  # Add this import
from .database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="Security Personnel")
    is_active = Column(Boolean, default=True)

class StorageChamber(Base):
    __tablename__ = 'storage_chambers'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    chamber_type = Column(String, nullable=False)
    occupancy_status = Column(String, nullable=False, default='Vacant')
    condition = Column(String, nullable=False, default='Operational')
    location = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    special_requirements = Column(String, nullable=True)

    # Relationship to objects
    objects = relationship("Object", back_populates="storage_chamber")

class Object(Base):
    __tablename__ = 'objects'

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, unique=True, index=True, nullable=False)  # Unique object ID
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    classification = Column(String, nullable=False)
    threat_level = Column(String, nullable=False)
    special_containment_procedures = Column(String, nullable=True)
    storage_chamber_id = Column(Integer, ForeignKey('storage_chambers.id'), nullable=True)

    # Relationship to storage chamber
    storage_chamber = relationship("StorageChamber", back_populates="objects")
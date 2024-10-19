from sqlalchemy import Column, Integer, String, Boolean
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
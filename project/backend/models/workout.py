# backend/models/workout.py
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, Text
from sqlalchemy.orm import relationship
from . import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  
    date = Column(Date, nullable=False)                 
    wtype = Column(String(80), nullable=False)          
    duration_min = Column(Integer, nullable=False)      
    calories = Column(Float, nullable=True)             
    notes = Column(Text, nullable=True)                

    user = relationship("User", back_populates="workouts")

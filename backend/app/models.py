"""
Data models for stellar data from NASA APIs
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class OrbitingBody(BaseModel):
    """Represents a planet or other body orbiting a star"""
    name: str
    type: Literal["planet", "asteroid", "dwarf-planet", "moon"]
    orbitRadius: float  # In AU or relative units
    color: str
    # NASA-specific fields
    mass: Optional[float] = None  # Earth masses
    radius: Optional[float] = None  # Earth radii
    orbitalPeriod: Optional[float] = None  # Days
    discoveryYear: Optional[int] = None


class StarLocation(BaseModel):
    """Location information for a star"""
    galaxy: str = "Milky Way"
    region: str
    distanceFromEarth: str
    distanceLightYears: float
    # NASA-specific fields
    rightAscension: Optional[str] = None
    declination: Optional[str] = None
    constellation: Optional[str] = None


class StarData(BaseModel):
    """Complete star data matching frontend interface"""
    id: str
    name: str
    type: Literal[
        "Red Dwarf",
        "Orange Dwarf", 
        "Yellow Dwarf",
        "White Dwarf",
        "Blue Giant",
        "Red Giant",
        "Neutron Star",
        "Blue Supergiant",
        "Red Supergiant"
    ]
    temperature: int  # Kelvin
    sizeRatio: float  # Compared to the Sun
    luminosity: float  # Compared to the Sun
    lifespan: str
    funFact: str
    location: StarLocation
    hasOrbitingBodies: bool
    orbitingBodies: List[OrbitingBody]
    generatedAt: datetime
    
    # NASA-specific additional fields
    realStar: bool = True  # Flag to indicate this is real data
    catalogId: Optional[str] = None  # NASA catalog identifier
    mass: Optional[float] = None  # Solar masses
    age: Optional[float] = None  # Billion years
    spectralType: Optional[str] = None  # e.g., "G2V"
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "nasa-proxima-centauri",
                "name": "Proxima Centauri",
                "type": "Red Dwarf",
                "temperature": 3042,
                "sizeRatio": 0.14,
                "luminosity": 0.0017,
                "lifespan": "4 trillion years",
                "funFact": "Proxima Centauri is the closest star to our Sun, just 4.24 light-years away!",
                "location": {
                    "galaxy": "Milky Way",
                    "region": "Orion Arm",
                    "distanceFromEarth": "4.24 light years",
                    "distanceLightYears": 4.24,
                    "constellation": "Centaurus"
                },
                "hasOrbitingBodies": True,
                "orbitingBodies": [
                    {
                        "name": "Proxima Centauri b",
                        "type": "planet",
                        "orbitRadius": 0.05,
                        "color": "#d4a5a5",
                        "mass": 1.17,
                        "orbitalPeriod": 11.2
                    }
                ],
                "generatedAt": "2026-02-01T00:00:00",
                "realStar": True,
                "catalogId": "HIP 70890",
                "spectralType": "M5.5Ve"
            }
        }
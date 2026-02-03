"""
Pydantic Models for Stellar Atlas API
Compatible with Pydantic v1
"""
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime


class OrbitingBody(BaseModel):
    name: str
    type: Literal["planet", "asteroid", "dwarf-planet", "moon"]
    orbitRadius: float
    color: str
    mass: Optional[float] = None
    radius: Optional[float] = None
    orbitalPeriod: Optional[float] = None
    discoveryYear: Optional[int] = None


class StarLocation(BaseModel):
    galaxy: str = "Milky Way"
    region: str
    distanceFromEarth: str
    distanceLightYears: float
    rightAscension: Optional[str] = None
    declination: Optional[str] = None
    constellation: Optional[str] = None


class StarData(BaseModel):
    id: str
    name: str
    type: Literal[
        "Red Dwarf",
        "Orange Dwarf",
        "Yellow Dwarf",
        "White Dwarf",
        "White Star",          # A-type main sequence (Sirius, Vega, Altair)
        "Blue Giant",
        "Red Giant",
        "Neutron Star",
        "Blue Supergiant",
        "Red Supergiant",
    ]
    temperature: int
    sizeRatio: float
    luminosity: float
    lifespan: str
    funFact: str
    location: StarLocation
    hasOrbitingBodies: bool
    orbitingBodies: List[OrbitingBody]
    generatedAt: datetime

    realStar: bool = True
    catalogId: Optional[str] = None
    mass: Optional[float] = None
    age: Optional[float] = None
    spectralType: Optional[str] = None

    class Config:
        # Pydantic v1 syntax
        schema_extra = {
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
                    "constellation": "Centaurus",
                },
                "hasOrbitingBodies": True,
                "orbitingBodies": [
                    {
                        "name": "Proxima Centauri b",
                        "type": "planet",
                        "orbitRadius": 0.05,
                        "color": "#d4a5a5",
                        "mass": 1.17,
                        "orbitalPeriod": 11.2,
                    }
                ],
                "generatedAt": "2026-02-01T00:00:00",
                "realStar": True,
                "catalogId": "HIP 70890",
                "spectralType": "M5.5Ve",
            }
        }
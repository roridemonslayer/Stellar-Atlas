"""
Service for fetching real star data from NASA and other astronomical databases
"""
import requests
import random
from typing import Optional, List, Dict
from datetime import datetime
import logging

# We'll use these for now - you can add API keys later if needed
NASA_EXOPLANET_API = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
SIMBAD_API = "https://simbad.cds.unistra.fr/simbad/sim-tap/sync"

logger = logging.getLogger(__name__)


class NASAStarService:
    """Fetches and processes real star data from NASA APIs"""
    
    # Famous real stars database (fallback/curated list)
    FAMOUS_STARS = [
        {
            "name": "Proxima Centauri",
            "type": "Red Dwarf",
            "temperature": 3042,
            "sizeRatio": 0.14,
            "luminosity": 0.0017,
            "mass": 0.12,
            "distance": 4.24,
            "spectralType": "M5.5Ve",
            "constellation": "Centaurus",
            "hasExoplanets": True,
            "funFact": "Proxima Centauri is the closest star to our Sun, just 4.24 light-years away!"
        },
        {
            "name": "Betelgeuse",
            "type": "Red Supergiant",
            "temperature": 3590,
            "sizeRatio": 764,
            "luminosity": 126000,
            "mass": 16.5,
            "distance": 548,
            "spectralType": "M1-2 Ia-Iab",
            "constellation": "Orion",
            "hasExoplanets": False,
            "funFact": "Betelgeuse is so large that if placed at the center of our Solar System, it would extend past the orbit of Mars!"
        },
        {
            "name": "Sirius A",
            "type": "Blue Giant",
            "temperature": 9940,
            "sizeRatio": 1.71,
            "luminosity": 25.4,
            "mass": 2.06,
            "distance": 8.6,
            "spectralType": "A1V",
            "constellation": "Canis Major",
            "hasExoplanets": False,
            "funFact": "Sirius is the brightest star in Earth's night sky and is actually a binary star system!"
        },
        {
            "name": "Rigel",
            "type": "Blue Supergiant",
            "temperature": 11000,
            "sizeRatio": 78,
            "luminosity": 120000,
            "mass": 21,
            "distance": 860,
            "spectralType": "B8 Ia",
            "constellation": "Orion",
            "hasExoplanets": False,
            "funFact": "Rigel is approximately 40,000 times more luminous than our Sun and shines with a brilliant blue-white color!"
        },
        {
            "name": "Alpha Centauri A",
            "type": "Yellow Dwarf",
            "temperature": 5790,
            "sizeRatio": 1.22,
            "luminosity": 1.52,
            "mass": 1.1,
            "distance": 4.37,
            "spectralType": "G2V",
            "constellation": "Centaurus",
            "hasExoplanets": False,
            "funFact": "Alpha Centauri A is remarkably similar to our Sun and is part of the closest star system to Earth!"
        },
        {
            "name": "Vega",
            "type": "Blue Giant",
            "temperature": 9602,
            "sizeRatio": 2.36,
            "luminosity": 40.12,
            "mass": 2.14,
            "distance": 25,
            "spectralType": "A0V",
            "constellation": "Lyra",
            "hasExoplanets": True,
            "funFact": "Vega was the northern pole star around 12,000 BCE and will be again around the year 13,727!"
        },
        {
            "name": "Arcturus",
            "type": "Red Giant",
            "temperature": 4286,
            "sizeRatio": 25.4,
            "luminosity": 170,
            "mass": 1.08,
            "distance": 36.7,
            "spectralType": "K0 III",
            "constellation": "Boötes",
            "hasExoplanets": False,
            "funFact": "Arcturus is the brightest star in the northern celestial hemisphere and is moving through space at 122 km/s!"
        },
        {
            "name": "Aldebaran",
            "type": "Red Giant",
            "temperature": 3910,
            "sizeRatio": 44.2,
            "luminosity": 439,
            "mass": 1.16,
            "distance": 65.3,
            "spectralType": "K5 III",
            "constellation": "Taurus",
            "hasExoplanets": True,
            "funFact": "Aldebaran, the 'Eye of the Bull,' is slowly being consumed by its own stellar winds as it nears the end of its life!"
        },
        {
            "name": "Antares",
            "type": "Red Supergiant",
            "temperature": 3570,
            "sizeRatio": 680,
            "luminosity": 75900,
            "mass": 12,
            "distance": 550,
            "spectralType": "M1.5Iab-Ib",
            "constellation": "Scorpius",
            "hasExoplanets": False,
            "funFact": "Antares, the 'rival of Mars,' is so huge that if it replaced our Sun, its surface would extend beyond the orbit of Mars!"
        },
        {
            "name": "Procyon A",
            "type": "Yellow Dwarf",
            "temperature": 6530,
            "sizeRatio": 2.05,
            "luminosity": 6.93,
            "mass": 1.42,
            "distance": 11.46,
            "spectralType": "F5 IV-V",
            "constellation": "Canis Minor",
            "hasExoplanets": False,
            "funFact": "Procyon is the eighth-brightest star in the night sky and forms the Winter Triangle with Sirius and Betelgeuse!"
        },
        {
            "name": "Pollux",
            "type": "Orange Dwarf",
            "temperature": 4666,
            "sizeRatio": 8.8,
            "luminosity": 43,
            "mass": 1.91,
            "distance": 33.78,
            "spectralType": "K0 III",
            "constellation": "Gemini",
            "hasExoplanets": True,
            "funFact": "Pollux has a confirmed giant planet, Pollux b, which is about 3 times the mass of Jupiter!"
        },
        {
            "name": "TRAPPIST-1",
            "type": "Red Dwarf",
            "temperature": 2566,
            "sizeRatio": 0.12,
            "luminosity": 0.000553,
            "mass": 0.09,
            "distance": 40.66,
            "spectralType": "M8V",
            "constellation": "Aquarius",
            "hasExoplanets": True,
            "funFact": "TRAPPIST-1 has seven Earth-sized planets, three of which orbit in the habitable zone!"
        },
        {
            "name": "Kepler-442",
            "type": "Orange Dwarf",
            "temperature": 4402,
            "sizeRatio": 0.61,
            "luminosity": 0.18,
            "mass": 0.61,
            "distance": 1206,
            "spectralType": "K5V",
            "constellation": "Lyra",
            "hasExoplanets": True,
            "funFact": "Kepler-442b is one of the most potentially habitable exoplanets discovered, with 97% Earth Similarity Index!"
        },
        {
            "name": "Tau Ceti",
            "type": "Yellow Dwarf",
            "temperature": 5344,
            "sizeRatio": 0.79,
            "luminosity": 0.52,
            "mass": 0.78,
            "distance": 11.91,
            "spectralType": "G8.5V",
            "constellation": "Cetus",
            "hasExoplanets": True,
            "funFact": "Tau Ceti is the closest single star similar to the Sun and may have four terrestrial planets in its system!"
        },
        {
            "name": "61 Cygni A",
            "type": "Orange Dwarf",
            "temperature": 4526,
            "sizeRatio": 0.67,
            "luminosity": 0.15,
            "mass": 0.7,
            "distance": 11.41,
            "spectralType": "K5V",
            "constellation": "Cygnus",
            "hasExoplanets": True,
            "funFact": "61 Cygni was the first star to have its distance measured through parallax in 1838!"
        }
    ]
    
    def __init__(self):
        self.session = requests.Session()
        
    def get_random_real_star(self) -> Dict:
        """Get a random real star from our curated database"""
        return random.choice(self.FAMOUS_STARS).copy()
    
    def get_star_by_name(self, name: str) -> Optional[Dict]:
        """Get a specific star by name"""
        for star in self.FAMOUS_STARS:
            if star["name"].lower() == name.lower():
                return star.copy()
        return None
    
    def fetch_exoplanet_data(self, star_name: str) -> List[Dict]:
        """
        Fetch exoplanet data from NASA Exoplanet Archive
        This is a placeholder - in production, you'd make real API calls
        """
        # For now, we'll generate realistic exoplanets based on star data
        exoplanet_templates = {
            "TRAPPIST-1": [
                {"name": "TRAPPIST-1b", "mass": 1.02, "radius": 1.12, "period": 1.51, "distance": 0.01111},
                {"name": "TRAPPIST-1c", "mass": 1.16, "radius": 1.10, "period": 2.42, "distance": 0.01521},
                {"name": "TRAPPIST-1d", "mass": 0.30, "radius": 0.77, "period": 4.05, "distance": 0.02144},
                {"name": "TRAPPIST-1e", "mass": 0.69, "radius": 0.92, "period": 6.10, "distance": 0.02817},
                {"name": "TRAPPIST-1f", "mass": 1.04, "radius": 1.04, "period": 9.21, "distance": 0.03707},
                {"name": "TRAPPIST-1g", "mass": 1.32, "radius": 1.13, "period": 12.35, "distance": 0.04510},
                {"name": "TRAPPIST-1h", "mass": 0.33, "radius": 0.76, "period": 18.77, "distance": 0.05990},
            ],
            "Proxima Centauri": [
                {"name": "Proxima Centauri b", "mass": 1.17, "radius": 1.1, "period": 11.2, "distance": 0.0485},
                {"name": "Proxima Centauri d", "mass": 0.26, "radius": 0.81, "period": 5.15, "distance": 0.029},
            ],
            "Vega": [
                {"name": "Vega b (candidate)", "mass": 5.2, "radius": 2.1, "period": 2.43, "distance": 0.04},
            ],
            "Pollux": [
                {"name": "Pollux b", "mass": 3.0, "radius": 1.6, "period": 589.64, "distance": 1.64},
            ],
            "Aldebaran": [
                {"name": "Aldebaran b", "mass": 6.47, "radius": 2.3, "period": 628.96, "distance": 1.46},
            ],
            "Tau Ceti": [
                {"name": "Tau Ceti e", "mass": 3.93, "radius": 1.5, "period": 168.12, "distance": 0.538},
                {"name": "Tau Ceti f", "mass": 3.93, "radius": 1.5, "period": 636.13, "distance": 1.334},
            ],
            "Kepler-442": [
                {"name": "Kepler-442b", "mass": 2.36, "radius": 1.34, "period": 112.3, "distance": 0.409},
            ],
            "61 Cygni A": [
                {"name": "61 Cygni Ab (candidate)", "mass": 1.7, "radius": 1.2, "period": 2.7, "distance": 0.035},
            ]
        }
        
        return exoplanet_templates.get(star_name, [])
    
    def calculate_lifespan(self, star_type: str, mass: float) -> str:
        """Calculate estimated stellar lifespan based on type and mass"""
        lifespan_map = {
            "Red Dwarf": f"{int(10000 / (mass ** 2.5))} trillion years",
            "Orange Dwarf": f"{int(15 + random.random() * 15)} billion years",
            "Yellow Dwarf": f"{int(10 / (mass ** 2.5))} billion years",
            "White Dwarf": "Cooling for eternity",
            "Red Giant": f"{int(100 + random.random() * 900)} million years",
            "Blue Giant": f"{int(10 + random.random() * 90)} million years",
            "Red Supergiant": f"{int(5 + random.random() * 15)} million years",
            "Blue Supergiant": f"{int(5 + random.random() * 25)} million years",
            "Neutron Star": "Billions of years",
        }
        return lifespan_map.get(star_type, "Unknown")
    
    def get_region_for_constellation(self, constellation: str) -> str:
        """Map constellation to galactic region"""
        region_map = {
            "Centaurus": "Orion Arm",
            "Orion": "Orion Arm",
            "Canis Major": "Orion Arm",
            "Lyra": "Orion-Cygnus Arm",
            "Boötes": "Outer Rim",
            "Taurus": "Orion Arm",
            "Scorpius": "Sagittarius Arm",
            "Canis Minor": "Orion Arm",
            "Gemini": "Orion Arm",
            "Aquarius": "Orion Arm",
            "Cetus": "Orion Arm",
            "Cygnus": "Orion-Cygnus Arm",
        }
        return region_map.get(constellation, "Orion Arm")


# Singleton instance
nasa_service = NASAStarService()
"""
Service for fetching real star data from NASA and other astronomical sources
"""
import requests
import random
from typing import Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# We'll use these for now - you can replace with actual API calls later
NASA_EXOPLANET_API = "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI"
SIMBAD_API = "https://simbad.cds.unistra.fr/simbad/sim-id"

# Famous real stars database
FAMOUS_STARS = [
    {
        "name": "Proxima Centauri",
        "type": "Red Dwarf",
        "temperature": 3042,
        "sizeRatio": 0.14,
        "luminosity": 0.0017,
        "mass": 0.12,
        "distance": 4.24,
        "constellation": "Centaurus",
        "catalogId": "HIP 70890",
        "spectralType": "M5.5Ve",
        "funFact": "Proxima Centauri is the closest star to our Sun, just 4.24 light-years away!",
        "hasExoplanets": True
    },
    {
        "name": "Betelgeuse",
        "type": "Red Supergiant",
        "temperature": 3500,
        "sizeRatio": 887,
        "luminosity": 126000,
        "mass": 16.5,
        "distance": 548,
        "constellation": "Orion",
        "catalogId": "Alpha Orionis",
        "spectralType": "M1-M2",
        "funFact": "Betelgeuse is so massive that if placed at the center of our solar system, it would extend past the orbit of Jupiter!",
        "hasExoplanets": False
    },
    {
        # Sirius is spectral type A1V — the "V" means main sequence, not giant.
        # Its size ratio of 1.71 confirms this.  Corrected from "Blue Giant".
        "name": "Sirius",
        "type": "White Star",
        "temperature": 9940,
        "sizeRatio": 1.71,
        "luminosity": 25.4,
        "mass": 2.063,
        "distance": 8.6,
        "constellation": "Canis Major",
        "catalogId": "Alpha Canis Majoris",
        "spectralType": "A1V",
        "funFact": "Sirius is the brightest star in Earth's night sky and is actually a binary star system!",
        "hasExoplanets": False
    },
    {
        "name": "Rigel",
        "type": "Blue Supergiant",
        "temperature": 11000,
        "sizeRatio": 78.9,
        "luminosity": 120000,
        "mass": 21,
        "distance": 860,
        "constellation": "Orion",
        "catalogId": "Beta Orionis",
        "spectralType": "B8Ia",
        "funFact": "Rigel is approximately 40,000 times more luminous than our Sun!",
        "hasExoplanets": False
    },
    {
        # Vega is spectral type A0V — same luminosity class as Sirius.
        # Corrected from "Blue Giant" to "White Star".
        "name": "Vega",
        "type": "White Star",
        "temperature": 9602,
        "sizeRatio": 2.362,
        "luminosity": 40.12,
        "mass": 2.135,
        "distance": 25,
        "constellation": "Lyra",
        "catalogId": "Alpha Lyrae",
        "spectralType": "A0V",
        "funFact": "Vega was the northern pole star around 12,000 BCE and will be again around the year 13,727!",
        "hasExoplanets": False
    },
    {
        "name": "Antares",
        "type": "Red Supergiant",
        "temperature": 3570,
        "sizeRatio": 883,
        "luminosity": 75900,
        "mass": 12,
        "distance": 550,
        "constellation": "Scorpius",
        "catalogId": "Alpha Scorpii",
        "spectralType": "M1.5Iab",
        "funFact": "Antares is sometimes called the 'Heart of the Scorpion' and rivals Mars in its reddish color!",
        "hasExoplanets": False
    },
    {
        "name": "Arcturus",
        "type": "Red Giant",
        "temperature": 4286,
        "sizeRatio": 25.4,
        "luminosity": 170,
        "mass": 1.08,
        "distance": 36.7,
        "constellation": "Boötes",
        "catalogId": "Alpha Boötis",
        "spectralType": "K0III",
        "funFact": "Arcturus is the brightest star in the northern celestial hemisphere!",
        "hasExoplanets": False
    },
    {
        "name": "Polaris",
        "type": "Yellow Dwarf",
        "temperature": 6015,
        "sizeRatio": 37.5,
        "luminosity": 2200,
        "mass": 5.4,
        "distance": 433,
        "constellation": "Ursa Minor",
        "catalogId": "Alpha Ursae Minoris",
        "spectralType": "F7Ib",
        "funFact": "Polaris is the North Star and has been used for navigation for thousands of years!",
        "hasExoplanets": False
    },
    {
        "name": "Alpha Centauri A",
        "type": "Yellow Dwarf",
        "temperature": 5790,
        "sizeRatio": 1.2,
        "luminosity": 1.519,
        "mass": 1.1,
        "distance": 4.37,
        "constellation": "Centaurus",
        "catalogId": "HIP 71683",
        "spectralType": "G2V",
        "funFact": "Alpha Centauri A is remarkably similar to our Sun in size, temperature, and composition!",
        "hasExoplanets": False
    },
    {
        "name": "Aldebaran",
        "type": "Red Giant",
        "temperature": 3910,
        "sizeRatio": 44.2,
        "luminosity": 439,
        "mass": 1.16,
        "distance": 65.3,
        "constellation": "Taurus",
        "catalogId": "Alpha Tauri",
        "spectralType": "K5III",
        "funFact": "Aldebaran is the eye of the bull in the constellation Taurus!",
        "hasExoplanets": True
    },
    {
        "name": "Deneb",
        "type": "Blue Supergiant",
        "temperature": 8525,
        "sizeRatio": 203,
        "luminosity": 196000,
        "mass": 19,
        "distance": 2615,
        "constellation": "Cygnus",
        "catalogId": "Alpha Cygni",
        "spectralType": "A2Ia",
        "funFact": "Deneb is one of the most luminous stars known, visible even from thousands of light-years away!",
        "hasExoplanets": False
    },
    {
        # Altair is spectral type A7V — main sequence, not a white dwarf remnant.
        # Its mass (1.79) and size ratio (1.79) confirm an active main-sequence star.
        # Corrected from "White Dwarf".
        "name": "Altair",
        "type": "White Star",
        "temperature": 7550,
        "sizeRatio": 1.79,
        "luminosity": 10.6,
        "mass": 1.79,
        "distance": 16.73,
        "constellation": "Aquila",
        "catalogId": "Alpha Aquilae",
        "spectralType": "A7V",
        "funFact": "Altair is one of the fastest rotating stars, spinning once every 9 hours!",
        "hasExoplanets": False
    },
    {
        "name": "Spica",
        "type": "Blue Giant",
        "temperature": 22400,
        "sizeRatio": 7.47,
        "luminosity": 20512,
        "mass": 11.43,
        "distance": 250,
        "constellation": "Virgo",
        "catalogId": "Alpha Virginis",
        "spectralType": "B1III-IV",
        "funFact": "Spica is actually a close binary star system with two stars orbiting each other every 4 days!",
        "hasExoplanets": False
    },
    {
        "name": "Procyon",
        "type": "Yellow Dwarf",
        "temperature": 6530,
        "sizeRatio": 2.048,
        "luminosity": 6.93,
        "mass": 1.499,
        "distance": 11.46,
        "constellation": "Canis Minor",
        "catalogId": "Alpha Canis Minoris",
        "spectralType": "F5IV",
        "funFact": "Procyon is part of the Winter Triangle asterism along with Sirius and Betelgeuse!",
        "hasExoplanets": False
    },
    {
        "name": "TRAPPIST-1",
        "type": "Red Dwarf",
        "temperature": 2566,
        "sizeRatio": 0.117,
        "luminosity": 0.000553,
        "mass": 0.089,
        "distance": 39.6,
        "constellation": "Aquarius",
        "catalogId": "2MASS J23062928-0502285",
        "spectralType": "M8V",
        "funFact": "TRAPPIST-1 has seven Earth-sized planets, three of which are in the habitable zone!",
        "hasExoplanets": True
    }
]

# Exoplanet data
EXOPLANET_DATA = {
    "Proxima Centauri": [
        {
            "name": "Proxima Centauri b",
            "distance": 0.0485,
            "mass": 1.17,
            "radius": 1.1,
            "period": 11.186
        },
        {
            "name": "Proxima Centauri d",
            "distance": 0.029,
            "mass": 0.26,
            "radius": 0.81,
            "period": 5.122
        }
    ],
    "Aldebaran": [
        {
            "name": "Aldebaran b",
            "distance": 1.46,
            "mass": 6.47,
            "radius": 2.3,
            "period": 628.96
        }
    ],
    "TRAPPIST-1": [
        {
            "name": "TRAPPIST-1b",
            "distance": 0.01154,
            "mass": 1.017,
            "radius": 1.116,
            "period": 1.51
        },
        {
            "name": "TRAPPIST-1c",
            "distance": 0.01580,
            "mass": 1.156,
            "radius": 1.097,
            "period": 2.42
        },
        {
            "name": "TRAPPIST-1d",
            "distance": 0.02227,
            "mass": 0.297,
            "radius": 0.788,
            "period": 4.05
        },
        {
            "name": "TRAPPIST-1e",
            "distance": 0.02925,
            "mass": 0.772,
            "radius": 0.920,
            "period": 6.10
        },
        {
            "name": "TRAPPIST-1f",
            "distance": 0.03849,
            "mass": 0.934,
            "radius": 1.045,
            "period": 9.21
        },
        {
            "name": "TRAPPIST-1g",
            "distance": 0.04683,
            "mass": 1.148,
            "radius": 1.129,
            "period": 12.35
        },
        {
            "name": "TRAPPIST-1h",
            "distance": 0.06189,
            "mass": 0.331,
            "radius": 0.755,
            "period": 18.77
        }
    ]
}


class NASAStarService:
    """Fetches and processes real star data"""

    def get_random_real_star(self):
        """Get a random star from our database"""
        return random.choice(FAMOUS_STARS).copy()

    def get_star_by_name(self, name: str) -> Optional[dict]:
        """Get a specific star by name"""
        name_lower = name.lower()
        for star in FAMOUS_STARS:
            if star["name"].lower() == name_lower:
                return star.copy()
        return None

    def fetch_exoplanet_data(self, star_name: str) -> List[dict]:
        """Fetch exoplanet data for a star"""
        return EXOPLANET_DATA.get(star_name, [])

    def get_region_for_constellation(self, constellation: str) -> str:
        """Map constellation to galactic region"""
        region_map = {
            "Orion": "Orion Arm",
            "Centaurus": "Orion Arm",
            "Canis Major": "Orion Arm",
            "Lyra": "Orion Arm",
            "Scorpius": "Sagittarius Arm",
            "Boötes": "Orion Arm",
            "Ursa Minor": "Orion Arm",
            "Taurus": "Perseus Arm",
            "Cygnus": "Orion-Cygnus Arm",
            "Aquila": "Orion Arm",
            "Virgo": "Orion Arm",
            "Canis Minor": "Orion Arm",
            "Aquarius": "Orion Arm"
        }
        return region_map.get(constellation, "Orion Arm")

    def calculate_lifespan(self, star_type: str, mass: float) -> str:
        """Calculate stellar lifespan based on type and mass"""
        lifespan_map = {
            "Red Dwarf": f"{int(4 * (1 / max(mass, 0.1)) ** 2.5)} trillion years",
            "Orange Dwarf": f"{int(20 * (1 / max(mass, 0.5)) ** 2.5)} billion years",
            "Yellow Dwarf": f"{int(10 * (1 / max(mass, 0.8)) ** 2.5)} billion years",
            # A-type main sequence stars — shorter-lived than Sun-like stars
            # due to higher mass.  Formula yields ~1-2 billion years for
            # typical masses in this range (1.7–2.1 solar masses).
            "White Star": f"{int(10 * (1 / max(mass, 1.5)) ** 2.5)} billion years",
            "White Dwarf": "Effectively eternal (cooling slowly)",
            "Blue Giant": f"{int(500 / max(mass, 5))} million years",
            "Red Giant": "Currently in final stages (few million years)",
            "Neutron Star": "Effectively eternal (stable remnant)",
            "Blue Supergiant": f"{int(100 / max(mass, 10))} million years",
            "Red Supergiant": "Currently in final stages (thousands to millions of years)"
        }
        return lifespan_map.get(star_type, "Unknown")


# Create a singleton instance
nasa_service = NASAStarService()
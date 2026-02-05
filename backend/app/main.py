"""
Stellar Atlas Backend API
Fetches real astronomical data from NASA and other sources
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random
import logging
from typing import List

# Import our models and services
from app.models import StarData, StarLocation, OrbitingBody
from app.services import nasa_service, FAMOUS_STARS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Stellar Atlas API",
    description="Real astronomical data from NASA for the Stellar Atlas app",
    version="1.0.0"
)

# Configure CORS to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",  # Vercel deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def format_star_data(raw_star: dict) -> StarData:
    """Convert raw star data to StarData model matching frontend interface"""

    # Get exoplanet data if star has planets
    exoplanets = []
    if raw_star.get("hasExoplanets"):
        planet_data = nasa_service.fetch_exoplanet_data(raw_star["name"])

        # Planet colors based on type/temperature
        colors = [
            "#d4a5a5",  # Rocky/Mars-like
            "#a8d5ba",  # Earth-like
            "#a5c4d4",  # Water world
            "#d4cfa5",  # Desert planet
            "#c4a5d4",  # Gas giant
            "#d4b5a5",  # Ice giant
        ]

        for i, planet in enumerate(planet_data):
            exoplanets.append(OrbitingBody(
                name=planet["name"],
                type="planet",
                orbitRadius=planet["visual_radius"],  # Use pre-calculated visual radius
                color=colors[i % len(colors)],
                mass=planet.get("mass"),
                radius=planet.get("radius"),
                orbitalPeriod=planet.get("period"),
                discoveryYear=None
            ))

    # Format distance
    distance = raw_star["distance"]
    if distance > 1000:
        distance_str = f"{distance / 1000:.1f}k light years"
    else:
        distance_str = f"{distance:.2f} light years"

    # Create star location
    location = StarLocation(
        galaxy="Milky Way",
        region=nasa_service.get_region_for_constellation(raw_star["constellation"]),
        distanceFromEarth=distance_str,
        distanceLightYears=distance,
        constellation=raw_star["constellation"]
    )

    # Calculate lifespan
    lifespan = nasa_service.calculate_lifespan(
        raw_star["type"],
        raw_star.get("mass", 1.0)
    )

    # Stable ID from name only
    star_id = f"nasa-{raw_star['name'].lower().replace(' ', '-')}"

    return StarData(
        id=star_id,
        name=raw_star["name"],
        type=raw_star["type"],
        temperature=raw_star["temperature"],
        sizeRatio=raw_star["sizeRatio"],
        luminosity=raw_star["luminosity"],
        lifespan=lifespan,
        funFact=raw_star["funFact"],
        location=location,
        hasOrbitingBodies=len(exoplanets) > 0,
        orbitingBodies=exoplanets,
        generatedAt=datetime.now(),
        realStar=True,
        catalogId=raw_star.get("catalogId"),
        mass=raw_star.get("mass"),
        spectralType=raw_star.get("spectralType")
    )


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Stellar Atlas API",
        "status": "online",
        "version": "1.0.0",
        "endpoints": {
            "generate_star": "/api/stars/generate",
            "get_star": "/api/stars/{name}",
            "daily_star": "/api/stars/daily",
            "list_stars": "/api/stars/list"
        }
    }


@app.get("/api/stars/generate", response_model=StarData)
async def generate_star():
    """
    Generate a random real star from NASA data
    This replaces the frontend's generateStar() function
    """
    try:
        raw_star = nasa_service.get_random_real_star()
        star = format_star_data(raw_star)
        logger.info(f"Generated star: {star.name} ({len(star.orbitingBodies)} planets)")
        return star
    except Exception as e:
        logger.error(f"Error generating star: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating star: {str(e)}")


@app.get("/api/stars/daily", response_model=StarData)
async def get_daily_star():
    """
    Get the star of the day (changes daily).
    Uses date-based seeding to ensure same star for all users on same day.
    """
    try:
        today = datetime.now()
        seed = today.year * 10000 + today.month * 100 + today.day

        random.seed(seed)
        raw_star = nasa_service.get_random_real_star()
        random.seed()  # Reset to system entropy

        star = format_star_data(raw_star)
        logger.info(f"Daily star for {today.date()}: {star.name}")
        return star
    except Exception as e:
        logger.error(f"Error getting daily star: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting daily star: {str(e)}")


@app.get("/api/stars/list")
async def list_available_stars():
    """List all available stars in the database."""
    try:
        stars = [
            {
                "name": star["name"],
                "type": star["type"],
                "distance": star["distance"],
                "constellation": star["constellation"],
                "hasExoplanets": star.get("hasExoplanets", False)
            }
            for star in FAMOUS_STARS
        ]
        return {"count": len(stars), "stars": stars}
    except Exception as e:
        logger.error(f"Error listing stars: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing stars: {str(e)}")


@app.get("/api/stars/{star_name}", response_model=StarData)
async def get_star_by_name(star_name: str):
    """
    Get a specific star by name.
    Example: /api/stars/Betelgeuse
    """
    try:
        star_name = star_name.replace("-", " ").replace("_", " ")
        raw_star = nasa_service.get_star_by_name(star_name)

        if not raw_star:
            raise HTTPException(status_code=404, detail=f"Star '{star_name}' not found")

        star = format_star_data(raw_star)
        logger.info(f"Retrieved star: {star.name}")
        return star
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting star {star_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving star: {str(e)}")


@app.get("/api/health")
async def health_check():
    """Health check for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "available_stars": len(FAMOUS_STARS),
        "stars_with_planets": len([s for s in FAMOUS_STARS if s.get("hasExoplanets")])
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
# Stellar Atlas Backend

Python FastAPI backend that provides real astronomical data from NASA and other sources.

## Features

- ✨ Real star data from famous stars (Betelgeuse, Proxima Centauri, etc.)
- 🪐 Exoplanet information from NASA Exoplanet Archive
- 📊 Accurate stellar properties (temperature, mass, luminosity)
- 🌍 Real distance measurements and locations
- 🎲 Random star generation using real data
- 📅 Daily star feature (consistent across users)

## Setup Instructions

### 1. Create the Backend Directory Structure

```bash
cd ~/Stellar-Atlas
mkdir -p backend/app
cd backend
```

### 2. Create the Files

Place these files in the `backend/app/` directory:
- `models.py` - Data models (Pydantic)
- `services.py` - NASA API service
- `main.py` - FastAPI application

Also create in `backend/`:
- `requirements.txt` - Python dependencies

### 3. Install Dependencies

```bash
# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Run the Backend

```bash
# Make sure you're in the backend directory
cd ~/Stellar-Atlas/backend

# Run the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### 5. Test the API

Open your browser and visit:
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/
- Generate star: http://localhost:8000/api/stars/generate
- Daily star: http://localhost:8000/api/stars/daily
- Specific star: http://localhost:8000/api/stars/Betelgeuse

## API Endpoints

### `GET /api/stars/generate`
Generate a random real star from the database.

**Response:**
```json
{
  "id": "nasa-proxima-centauri-1234567890",
  "name": "Proxima Centauri",
  "type": "Red Dwarf",
  "temperature": 3042,
  "sizeRatio": 0.14,
  "luminosity": 0.0017,
  "hasOrbitingBodies": true,
  "orbitingBodies": [...],
  "realStar": true
}
```

### `GET /api/stars/daily`
Get the star of the day (changes daily, consistent for all users).

### `GET /api/stars/{name}`
Get a specific star by name.

Example: `/api/stars/Betelgeuse`

### `GET /api/stars/list`
List all available stars in the database.

## Real Stars Included

The backend includes 15 famous real stars:

1. **Proxima Centauri** - Closest star to Earth (4.24 ly)
2. **Betelgeuse** - Red supergiant in Orion
3. **Sirius A** - Brightest star in night sky
4. **Rigel** - Blue supergiant in Orion
5. **Alpha Centauri A** - Sun-like star
6. **Vega** - Former pole star
7. **Arcturus** - Brightest in northern hemisphere
8. **Aldebaran** - Eye of the Bull
9. **Antares** - Rival of Mars
10. **Procyon A** - Brightest in Canis Minor
11. **Pollux** - Giant with exoplanet
12. **TRAPPIST-1** - 7 Earth-sized planets!
13. **Kepler-442** - Habitable zone planet
14. **Tau Ceti** - Close Sun-like star
15. **61 Cygni A** - Historic parallax measurement

## Future Enhancements

### Phase 2: Live NASA API Integration
- Connect to real NASA Exoplanet Archive
- Pull data from SIMBAD database
- Real-time updates

### Phase 3: Advanced Features
- Search stars by constellation
- Filter by star type
- Distance-based queries
- Habitability calculations

## Troubleshooting

### Port 8000 already in use
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn app.main:app --reload --port 8001
```

### Module import errors
Make sure you're running from the `backend` directory and using:
```bash
python -m uvicorn app.main:app --reload
```

### CORS errors in frontend
Check that the frontend URL is in the `allow_origins` list in `main.py`.

## Development

### Running in Development
```bash
# With auto-reload
uvicorn app.main:app --reload

# With custom host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running in Production
```bash
# Use gunicorn with uvicorn workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Architecture

```
Frontend (Next.js)          Backend (FastAPI)          Data Sources
     :3000          ←→           :8000            ←→   NASA APIs
                                                       SIMBAD
                                                       Local DB
```

## License

MIT License - Feel free to use for educational purposes!
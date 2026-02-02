"""
Diagnostic script to test your Stellar Atlas backend
Run this to see exactly what's wrong
"""

print("=" * 60)
print("STELLAR ATLAS BACKEND DIAGNOSTIC")
print("=" * 60)

# Test 1: Check if Python packages are installed
print("\n[1] Checking installed packages...")
try:
    import fastapi
    print(f"✅ FastAPI installed (version {fastapi.__version__})")
except ImportError:
    print("❌ FastAPI NOT installed")
    print("   Fix: pip install fastapi")

try:
    import uvicorn
    print(f"✅ Uvicorn installed (version {uvicorn.__version__})")
except ImportError:
    print("❌ Uvicorn NOT installed")
    print("   Fix: pip install uvicorn")

try:
    import pydantic
    print(f"✅ Pydantic installed (version {pydantic.__version__})")
except ImportError:
    print("❌ Pydantic NOT installed")
    print("   Fix: pip install pydantic")

# Test 2: Check if files exist
print("\n[2] Checking if required files exist...")
import os

files_to_check = [
    "models.py",
    "services.py",
    "main.py",
    "__init__.py"
]

for file in files_to_check:
    if os.path.exists(file):
        print(f"✅ {file} exists")
    else:
        print(f"❌ {file} missing")
        if file == "__init__.py":
            print(f"   Fix: Create empty {file} file")

# Test 3: Try importing models
print("\n[3] Testing models.py...")
try:
    from models import StarData, StarLocation, OrbitingBody
    print("✅ Models import successfully")
    
    # Try creating a test object
    test_location = StarLocation(
        region="Test",
        distanceFromEarth="10 ly",
        distanceLightYears=10
    )
    print("✅ Can create StarLocation object")
except Exception as e:
    print(f"❌ Models import failed: {e}")

# Test 4: Try importing services
print("\n[4] Testing services.py...")
try:
    from services import nasa_service
    print("✅ nasa_service imported successfully")
    
    # Check if it has required attributes
    if hasattr(nasa_service, 'FAMOUS_STARS'):
        print(f"✅ FAMOUS_STARS exists ({len(nasa_service.FAMOUS_STARS)} stars)")
    else:
        print("❌ FAMOUS_STARS not found in nasa_service")
    
    if hasattr(nasa_service, 'get_random_real_star'):
        print("✅ get_random_real_star() method exists")
        # Try calling it
        try:
            star = nasa_service.get_random_real_star()
            print(f"✅ get_random_real_star() works - got {star['name']}")
        except Exception as e:
            print(f"❌ get_random_real_star() error: {e}")
    else:
        print("❌ get_random_real_star() method not found")
        
except Exception as e:
    print(f"❌ Services import failed: {e}")
    import traceback
    traceback.print_exc()

# Test 5: Try importing main app
print("\n[5] Testing main.py...")
try:
    from main import app, format_star_data
    print("✅ Main app imported successfully")
    
    # Try to create a test star
    try:
        from services import nasa_service
        raw_star = nasa_service.get_star_by_name("Betelgeuse")
        if raw_star:
            star_data = format_star_data(raw_star)
            print(f"✅ format_star_data() works - created {star_data.name}")
        else:
            print("❌ Could not find Betelgeuse in database")
    except Exception as e:
        print(f"❌ format_star_data() error: {e}")
        
except Exception as e:
    print(f"❌ Main app import failed: {e}")
    import traceback
    traceback.print_exc()

# Test 6: Summary and next steps
print("\n" + "=" * 60)
print("SUMMARY & NEXT STEPS")
print("=" * 60)

print("""
If you see ❌ errors above:

1. Missing packages (fastapi, uvicorn, pydantic)?
   → Run: pip install fastapi uvicorn pydantic

2. Missing __init__.py?
   → Create an empty file: touch __init__.py

3. Import errors in services.py?
   → Replace services.py with the corrected version I provided

4. All ✅ green checks?
   → Your backend is ready! Start it with:
     uvicorn main:app --reload --port 8000

Then test at: http://localhost:8000/docs
""")
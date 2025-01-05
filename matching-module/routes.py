from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel
from typing import Dict, List, Optional

router = APIRouter()

class Preferences(BaseModel):
    interests: Optional[str] = ""
    sizes: Optional[Dict[str, str]] = {}
    wishlist: Optional[str] = None
    restrictions: Optional[str] = None
    ageGroup: Optional[str] = "30-49"
    gender: Optional[str] = "Prefer not to say"
    priceRange: Optional[str] = None
    stylePreference: Optional[str] = None
    sustainability: Optional[str] = None

@router.post("/match-products")
async def match_products(
    request: Request,
    preferences: Preferences,
    page: int = Query(1, ge=1),
    pageSize: int = Query(6, ge=1, le=50)
):
    """Match products based on user preferences."""
    print("Received preferences:", preferences)
    try:
        # Get products
        products = request.app.state.data_fetcher.get_products()
        if not products:
            raise HTTPException(status_code=500, detail="Failed to fetch products")
        print("Fetched products:", len(products))
        
        # Convert preferences to dict and add pagination
        prefs_dict = preferences.dict()
        prefs_dict['page'] = page
        prefs_dict['pageSize'] = pageSize
        
        # Get recommendations
        try:
            recommendations = request.app.state.model.get_recommendations(products, prefs_dict)
            print("Got recommendations:", len(recommendations))
            return recommendations
        except Exception as e:
            import traceback
            print("Error getting recommendations:")
            print(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        import traceback
        print("Error in match_products:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

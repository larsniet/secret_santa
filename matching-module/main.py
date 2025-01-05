from fastapi import FastAPI
from routes import router
import uvicorn
from model import ProductRecommender
from data_fetcher import DataFetcher
import os
import joblib

def initialize_model():
    """Initialize or load the model."""
    model_path = 'models/model.pkl'
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    try:
        if os.path.exists(model_path):
            print("Loading existing model...")
            return joblib.load(model_path)
    except Exception as e:
        print(f"Error loading model: {e}")
    
    print("Initializing new model...")
    model = ProductRecommender()
    data_fetcher = DataFetcher()
    
    print("Training new model...")
    products = data_fetcher.get_products()
    if not products:
        raise Exception("No products available for training. Please check the data source.")
    print(f"Fetched {len(products)} products for training")
    
    sample_prefs = {
        "interests": "general",
        "wishlist": "",
        "restrictions": "",
        "ageGroup": "26-35",
        "gender": "prefer not to say",
    }
    
    model.train(products, sample_prefs)
    print("Model training completed")
    
    # Save the trained model
    try:
        joblib.dump(model, model_path)
        print("Model saved successfully")
    except Exception as e:
        print(f"Warning: Could not save model: {e}")
    
    return model

# Initialize model and data fetcher
model = initialize_model()
data_fetcher = DataFetcher()

app = FastAPI(
    title="Secret Santa Gift Matcher",
    description="API for matching users with gift recommendations based on preferences",
    version="1.0.0"
)

# Make model available to routes
app.state.model = model
app.state.data_fetcher = data_fetcher

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)  # Disable auto-reload

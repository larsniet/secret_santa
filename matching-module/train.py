import logging
from data_fetcher import DataFetcher
from model import ProductRecommender
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_model():
    # Fetch products
    logger.info("Fetching products...")
    data_fetcher = DataFetcher()
    products = data_fetcher.get_products()
    
    # Load training preferences
    logger.info("Loading training preferences...")
    with open('data/production_preferences.json', 'r') as f:
        preferences = json.load(f)
    logger.info(f"Loaded {len(preferences)} training preference profiles")
    
    # Train model
    logger.info("Training model with expanded dataset...")
    recommender = ProductRecommender()
    recommender.train(products, preferences)
    
    # Save sample preferences for testing
    logger.info("Saved sample preferences for testing")

if __name__ == "__main__":
    train_model()

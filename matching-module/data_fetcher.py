import requests
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

class DataFetcher:
    def __init__(self):
        self.product_api_url = 'https://fakestoreapi.com/products'
    
    def get_products(self) -> List[Dict]:
        """Fetch products from the API."""
        try:
            response = requests.get(self.product_api_url)
            response.raise_for_status()
            raw_products = response.json()
            
            # Log the first product to see its structure
            if raw_products:
                logger.info(f"Sample product from API: {raw_products[0]}")
            
            # Transform products into our expected format
            transformed_products = []
            for product in raw_products:
                transformed_product = {
                    'id': product.get('id', hash(product.get('title', ''))),  # Fallback to hash of title
                    'title': product.get('title', ''),
                    'description': product.get('description', ''),
                    'price': float(product.get('price', 0)),
                    'category': product.get('category', '').lower(),
                    'image': product.get('image', '')
                }
                transformed_products.append(transformed_product)
            
            logger.info(f"Transformed {len(transformed_products)} products")
            if transformed_products:
                logger.info(f"Sample transformed product: {transformed_products[0]}")
            
            return transformed_products
        except Exception as e:
            logger.error(f"Error fetching products: {e}")
            return []

import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import json
import os

class ProductRecommender:
    def __init__(self):
        # Initialize model components
        self.product_data = None
        
        # Load data files
        self._load_interest_clusters()
        self._load_personality_affinities()
        self._load_category_hierarchy()
    
    def train(self, products, preferences):
        """Train the recommendation model."""
        # Save products for later use
        self.product_data = products
        
        # Save model
        os.makedirs('models', exist_ok=True)
        joblib.dump(self, 'models/model.pkl')
    
    def __getstate__(self):
        """Return state values to be pickled."""
        state = self.__dict__.copy()
        return state

    def __setstate__(self, state):
        """Restore state from the unpickled state values."""
        self.__dict__.update(state)
        
        # Reload data from JSON files
        self._load_interest_clusters()
        self._load_personality_affinities()
        self._load_category_hierarchy()

    def _load_interest_clusters(self):
        """Load the interest clusters from the JSON file."""
        try:
            clusters_path = os.path.join('data', 'interest_clusters.json')
            with open(clusters_path, 'r') as f:
                self.interest_clusters = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load interest clusters: {e}")
            self.interest_clusters = {}
    
    def _load_personality_affinities(self):
        """Load the personality product affinities from the JSON file."""
        try:
            affinities_path = os.path.join('data', 'personality_affinities.json')
            with open(affinities_path, 'r') as f:
                self.personality_product_affinities = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load personality affinities: {e}")
            self.personality_product_affinities = {}
    
    def _load_category_hierarchy(self):
        """Load the category hierarchy from the JSON file."""
        try:
            hierarchy_path = os.path.join('data', 'category_hierarchy.json')
            with open(hierarchy_path, 'r') as f:
                self.category_hierarchy = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load category hierarchy: {e}")
            self.category_hierarchy = {
                'Electronics & Gadgets': {
                    'keywords': ['tech', 'electronic', 'gadget', 'device', 'digital'],
                    'subcategories': {
                        'General Electronics': ['electronic', 'gadget', 'device']
                    }
                }
            }
    

    def _calculate_gender_multiplier(self, category, title, description, gender_score):
        """Calculate gender appropriateness multiplier dynamically."""
        text = f"{category} {title} {description}".lower()
        
        # No strong gender preference
        if -0.3 <= gender_score <= 0.3:
            return 1.0
            
        # Strong feminine preference
        if gender_score > 0.3:
            feminine_indicators = {'women', 'womens', 'female', 'ladies', 'girl', 'feminine', 'princess', 'cute', 'kawaii'}
            masculine_indicators = {'men', 'mens', 'male', 'masculine', 'guy', 'boy', 'gaming', 'beard'}
            neutral_tech = {'computer', 'gaming', 'electronics', 'digital', 'drive', 'ssd', 'storage', 'tech'}
            
            # Check for gender-specific terms
            feminine_matches = len([word for word in feminine_indicators if word in text])
            masculine_matches = len([word for word in masculine_indicators if word in text])
            tech_matches = len([word for word in neutral_tech if word in text])
            
            if masculine_matches > 0:
                return 0.1  # Stronger penalty for masculine items
            elif tech_matches > 0:
                return 0.3  # Significant penalty for tech items unless they match interests
            elif feminine_matches > 0:
                return 2.0  # Boost for feminine items
            elif 'jewelry' in category or 'accessories' in category:
                return 1.5
            else:
                return 0.5  # Penalty for gender-neutral items
            
        # Strong masculine preference
        if gender_score < -0.3:
            if 'men' in text or 'mens' in text:
                return 2.0
            elif 'women' in text or 'womens' in text or 'jewelry' in category:
                return 0.1
            elif any(tech in text for tech in ['computer', 'gaming', 'electronics', 'digital', 'drive', 'ssd']):
                return 0.3
            else:
                return 0.5  # Penalty for gender-neutral items
            
        return 1.0

    def _analyze_user_profile(self, preferences):
        """Analyze user preferences to build a comprehensive profile."""
        profile = {}
        preferences = preferences or {}
        if isinstance(preferences, dict) and 'preferences' in preferences:
            preferences = preferences['preferences']
        
        # Get basic preferences
        interests = preferences.get('interests', '').lower() if preferences else ''
        hobbies = preferences.get('hobbies', '').lower() if preferences else ''
        wishlist = preferences.get('wishlist', '').lower() if preferences else ''
        gender = preferences.get('gender', '').lower() if preferences else ''
        
        # Combine all text for analysis
        all_text = f"{interests} {hobbies} {wishlist}".lower()
        
        # Calculate gender score
        profile['gender_score'] = self._calculate_gender_score(gender, all_text)
        
        # Extract interests and categories
        profile['primary_interests'] = [w for w in interests.split() if len(w) > 2]
        profile['secondary_interests'] = [w for w in hobbies.split() if len(w) > 2]
        
        # Build suggested categories
        suggested_categories = set()
        
        # Add categories based on gender preference
        if profile['gender_score'] > 0.5:  # Strong feminine preference
            suggested_categories.update(['women', 'womens', 'jewelry', 'accessories', 'beauty'])
        elif profile['gender_score'] < -0.5:  # Strong masculine preference
            suggested_categories.update(['men', 'mens', 'masculine'])
        
        # Add categories from interests
        for word in profile['primary_interests']:
            if len(word) > 3:  # Avoid short words
                suggested_categories.add(word)
        
        profile['suggested_categories'] = list(suggested_categories)
        return profile

    def _calculate_gender_score(self, explicit_gender, text):
        """Calculate gender score from -1 (masculine) to 1 (feminine)."""
        # Explicit gender takes precedence
        if 'female' in explicit_gender or 'woman' in explicit_gender:
            return 1.0
        if 'male' in explicit_gender or 'man' in explicit_gender:
            return -1.0
        
        # Otherwise analyze text
        feminine_signals = {
            'strong': {'pink', 'cute', 'kawaii', 'princess', 'glitter'},
            'medium': {'flower', 'butterfly', 'beauty', 'fashion', 'dress'},
            'weak': {'purple', 'rose', 'soft', 'gentle'}
        }
        
        masculine_signals = {
            'strong': {'beard', 'muscle', 'masculine', 'tough'},
            'medium': {'sports', 'gaming', 'rugged', 'tactical'},
            'weak': {'tech', 'gadget', 'tools'}
        }
        
        words = set(text.split())
        
        # Calculate weighted scores
        fem_score = (
            len(words & feminine_signals['strong']) * 0.4 +
            len(words & feminine_signals['medium']) * 0.2 +
            len(words & feminine_signals['weak']) * 0.1
        )
        
        masc_score = (
            len(words & masculine_signals['strong']) * 0.4 +
            len(words & masculine_signals['medium']) * 0.2 +
            len(words & masculine_signals['weak']) * 0.1
        )
        
        if fem_score > masc_score:
            return min(1.0, fem_score)
        elif masc_score > fem_score:
            return max(-1.0, -masc_score)
        return 0.0

    def get_recommendations(self, products, preferences, num_recommendations=20):
        """Get product recommendations based on user preferences."""
        profile = self._analyze_user_profile(preferences)
        
        scored_products = []
        for product in self.product_data:
            title = product.get('title', '').lower()
            category = product.get('category', '').lower()
            description = product.get('description', '').lower()
            product_text = f"{title} {description} {category}"
            
            # Calculate main score components
            relevance_score = self._calculate_relevance_score(product_text, profile)
            gender_score = self._calculate_product_gender_score(product_text, profile['gender_score'])
            
            # Final score calculation
            if abs(profile['gender_score']) > 0.5:  # Strong gender preference
                # Gender-inappropriate products should be heavily penalized
                if gender_score < 0.3:  # Product doesn't match gender preference
                    final_score = 0.1  # Effectively exclude it
                else:
                    final_score = (
                        relevance_score * 0.4 +
                        gender_score * 0.4 
                    )
            else:
                # No strong gender preference - focus on relevance
                final_score = (
                    relevance_score * 0.6 +
                    gender_score * 0.2
                )
            
            scored_products.append((final_score, product))
        
        # Sort products by score
        scored_products.sort(key=lambda x: x[0], reverse=True)
        
        # Get pagination parameters
        page = int(preferences.get('page', 1))
        page_size = int(preferences.get('pageSize', num_recommendations))
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        # Get the slice of products for the current page
        page_products = scored_products[start_idx:end_idx]
        
        # Format recommendations
        recommendations = []
        for score, product in page_products:
            recommendations.append({
                'id': str(product.get('id', hash(product['title']))),
                'name': product.get('title', ''),
                'category': product.get('category', ''),
                'matchedCategory': self._get_matched_category(product.get('category', ''), profile),
                'price': float(product.get('price', 0)),
                'imageUrl': product.get('image', ''),
                'matchScore': int(round(score * 100)),
                'description': product.get('description', '')
            })
        
        return recommendations

    def _calculate_relevance_score(self, product_text, profile):
        """Calculate how relevant a product is based on interests."""
        score = 0.0
        
        # Check primary interests (direct matches)
        primary_matches = sum(1 for interest in profile['primary_interests'] 
                            if interest in product_text)
        if primary_matches:
            score += 0.6 * min(1.0, primary_matches / len(profile['primary_interests']))
        
        # Check category matches
        category_matches = sum(1 for cat in profile['suggested_categories'] 
                             if cat in product_text)
        if category_matches:
            score += 0.4 * min(1.0, category_matches / len(profile['suggested_categories']))
        
        return min(1.0, score)

    def _calculate_product_gender_score(self, product_text, gender_preference):
        """Calculate how well a product matches gender preference."""
        if abs(gender_preference) < 0.3:  # No strong preference
            return 1.0
        
        # Define gender indicators in product
        feminine_indicators = {'women', 'womens', 'female', 'ladies', 'feminine', 'girl'}
        masculine_indicators = {'men', 'mens', 'male', 'masculine', 'guy', 'boy'}
        neutral_indicators = {'unisex', 'universal', 'generic'}
        tech_indicators = {'computer', 'gaming', 'electronics', 'digital', 'drive', 'ssd', 'storage', 'tech'}
        
        has_feminine = any(ind in product_text for ind in feminine_indicators)
        has_masculine = any(ind in product_text for ind in masculine_indicators)
        has_neutral = any(ind in product_text for ind in neutral_indicators)
        has_tech = any(ind in product_text for ind in tech_indicators)
        
        if gender_preference > 0:  # Feminine preference
            if has_masculine:
                return 0.1  # Strong penalty
            if has_tech:
                return 0.2  # Very strong penalty for tech items
            if has_feminine:
                return 1.0
            if has_neutral:
                return 0.7
            return 0.5  # Default for unclear items
        else:  # Masculine preference
            if has_feminine:
                return 0.1
            if has_masculine:
                return 1.0
            if has_tech:
                return 0.8  # Tech items are more acceptable for masculine preference
            if has_neutral:
                return 0.7
            return 0.5

    def _get_matched_category(self, category, profile):
        """Get a user-friendly category match."""
        if not category:
            return "General"
            
        category = category.lower()
        
        # Check for gender-specific categories
        if profile['gender_score'] > 0.5:  # Feminine
            if any(term in category for term in ['women', 'jewelry', 'beauty']):
                return f"Women's {category.title()}"
        elif profile['gender_score'] < -0.5:  # Masculine
            if any(term in category for term in ['men', 'masculine']):
                return f"Men's {category.title()}"
        
        # Check for interest-based categories
        for interest in profile['primary_interests']:
            if interest in category:
                return f"{interest.title()} {category.title()}"
        
        return category.title()

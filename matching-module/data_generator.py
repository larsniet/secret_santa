import json
import random
from typing import List, Dict, Tuple
from itertools import combinations

class ProductionPreferenceGenerator:
    def __init__(self):
        # Initialize base attributes first
        self.clothing_sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        self.shoe_sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
        self.ring_sizes = ['5', '6', '7', '8', '9', '10']
        self.age_groups = ['0-12', '13-19', '20-29', '30-49', '50+']
        self.genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
        
        self.price_ranges = ['budget', 'mid-range', 'premium', 'luxury']
        self.sustainability_preferences = ['eco-friendly', 'sustainable', 'organic', 'fair trade']
        self.style_preferences = ['minimalist', 'maximalist', 'classic', 'modern', 'vintage', 'avant-garde']
        
        self.colors_by_style = {
            'classic': ['black', 'navy', 'white', 'gray', 'brown', 'beige'],
            'bold': ['red', 'yellow', 'orange', 'purple', 'bright blue', 'hot pink'],
            'pastel': ['light blue', 'mint green', 'lavender', 'peach', 'rose', 'light yellow'],
            'earth': ['olive green', 'burgundy', 'forest green', 'terracotta', 'rust', 'brown'],
            'monochrome': ['black', 'white', 'gray', 'charcoal'],
            'jewel': ['emerald', 'sapphire', 'ruby', 'amethyst', 'topaz'],
            'neon': ['neon green', 'neon pink', 'neon yellow', 'neon blue'],
            'metallic': ['silver', 'gold', 'rose gold', 'bronze', 'copper'],
            'natural': ['sage green', 'sky blue', 'sand', 'stone', 'ocean blue']
        }
        
        self.common_restrictions = [
            'no food items', 'no alcohol', 'no leather products', 'no animal products',
            'no fragrances', 'no nuts', 'no dairy products', 'no electronics',
            'no jewelry', 'no clothing', 'no synthetic materials', 'no plastic',
            'no fast fashion', 'no mass-produced items', 'no chemical products',
            'no batteries', 'no disposable items', 'no artificial ingredients'
        ]
        
        # Main personas with sub-categories
        self.persona_categories = {
            'tech_enthusiast': {
                'casual_tech': 0.4,  # 40% of tech enthusiasts
                'professional_tech': 0.3,
                'gaming_focused': 0.2,
                'smart_home_enthusiast': 0.1
            },
            'outdoor_enthusiast': {
                'casual_outdoors': 0.35,
                'extreme_sports': 0.25,
                'nature_photographer': 0.2,
                'wilderness_survival': 0.2
            },
            'fashion_lover': {
                'casual_fashion': 0.3,
                'luxury_fashion': 0.2,
                'sustainable_fashion': 0.25,
                'vintage_fashion': 0.25
            }
        }
        
        # Seasonal variations
        self.seasonal_interests = {
            'winter': ['skiing', 'snowboarding', 'winter fashion', 'indoor activities'],
            'spring': ['gardening', 'outdoor running', 'spring fashion', 'photography'],
            'summer': ['beach activities', 'summer sports', 'travel', 'outdoor events'],
            'fall': ['hiking', 'fall fashion', 'indoor crafts', 'home decoration']
        }
        
        # Regional variations
        self.regional_preferences = {
            'urban': {
                'interests_boost': ['technology', 'fashion', 'dining'],
                'style_boost': ['modern', 'minimalist']
            },
            'suburban': {
                'interests_boost': ['home decoration', 'gardening', 'family activities'],
                'style_boost': ['classic', 'traditional']
            },
            'rural': {
                'interests_boost': ['outdoor activities', 'crafts', 'nature'],
                'style_boost': ['rustic', 'practical']
            }
        }
        
        # Age-appropriate interest mappings
        self.age_appropriate_interests = {
            '0-12': {
                'boost': ['gaming', 'social media', 'trendy fashion'],
                'reduce': ['antiques', 'classical music', 'traditional crafts']
            },
            '13-19': {
                'boost': ['tech gadgets', 'fitness', 'home decoration'],
                'reduce': ['retirement planning', 'senior activities']
            },
            '20-29': {
                'boost': ['home improvement', 'family activities', 'career development'],
                'reduce': ['trendy fashion', 'extreme sports']
            },
            '30-49': {
                'boost': ['gardening', 'cooking', 'wellness'],
                'reduce': ['gaming', 'trendy fashion']
            },
            '50+': {
                'boost': ['classical music', 'reading', 'traditional crafts'],
                'reduce': ['extreme sports', 'nightlife']
            }
        }
        
        # Initialize expanded attributes
        self._init_expanded_attributes()
    
    def _init_expanded_attributes(self):
        # Initialize interests by persona subcategories
        self.interests_by_persona = {
            'tech_enthusiast': {
                'casual_tech': [
                    'consumer electronics', 'mobile devices', 'smart home basics',
                    'casual gaming', 'tech news', 'social media', 'streaming services'
                ],
                'professional_tech': [
                    'programming', 'artificial intelligence', 'cybersecurity',
                    'cloud computing', 'data science', 'enterprise software'
                ],
                'gaming_focused': [
                    'PC gaming', 'console gaming', 'VR gaming', 'esports',
                    'game development', 'streaming gear', 'gaming peripherals'
                ],
                'smart_home_enthusiast': [
                    'home automation', 'IoT devices', 'smart security',
                    'energy management', 'smart appliances', 'voice assistants'
                ]
            },
            'outdoor_enthusiast': {
                'casual_outdoors': [
                    'hiking', 'camping', 'nature walks', 'bird watching',
                    'photography', 'picnicking', 'casual cycling'
                ],
                'extreme_sports': [
                    'rock climbing', 'mountain biking', 'white water rafting',
                    'skydiving', 'snowboarding', 'surfing'
                ],
                'nature_photographer': [
                    'wildlife photography', 'landscape photography', 'macro photography',
                    'nature documentation', 'drone photography'
                ],
                'wilderness_survival': [
                    'bushcraft', 'navigation', 'survival skills',
                    'foraging', 'wilderness first aid'
                ]
            },
            'fashion_lover': {
                'casual_fashion': [
                    'streetwear', 'casual style', 'everyday fashion',
                    'affordable fashion', 'mix and match'
                ],
                'luxury_fashion': [
                    'designer brands', 'haute couture', 'luxury accessories',
                    'fashion shows', 'premium materials'
                ],
                'sustainable_fashion': [
                    'eco-friendly materials', 'ethical fashion', 'secondhand',
                    'upcycling', 'slow fashion'
                ],
                'vintage_fashion': [
                    'retro style', 'vintage shopping', 'classic fashion',
                    'antique accessories', 'period clothing'
                ]
            }
        }
        
        # Add seasonal color variations
        self.colors_by_style['seasonal'] = {
            'winter': ['ice blue', 'silver', 'winter white', 'deep green'],
            'spring': ['coral', 'mint', 'blush pink', 'soft yellow'],
            'summer': ['aqua', 'sunshine yellow', 'tropical green', 'ocean blue'],
            'fall': ['burnt orange', 'deep red', 'forest green', 'warm brown']
        }
        
        # Add more size variations
        self.clothing_sizes.extend(['XXXS', 'XXXL', 'Petite', 'Tall'])
        self.shoe_sizes.extend(['35', '46', '47', '48'])
        
        # Add more price points
        self.price_ranges.extend(['ultra-budget', 'ultra-luxury', 'mid-premium'])
        
        # Add more style variations
        self.style_preferences.extend([
            'sustainable-luxe', 'tech-minimal', 'eco-maximalist',
            'urban-outdoors', 'smart-casual', 'athleisure'
        ])
    
    def generate_production_preferences(self, num_profiles: int) -> List[Dict]:
        profiles = []
        
        # Calculate distribution based on market research
        distribution = self._calculate_demographic_distribution(num_profiles)
        
        for demographic, count in distribution.items():
            age_group, region, season = demographic
            
            for _ in range(count):
                # Generate base profile
                profile = self._generate_demographic_profile(age_group, region, season)
                
                # Add variations and noise
                profile = self._add_profile_variations(profile)
                
                # Validate and clean profile
                profile = self._validate_profile(profile)
                
                profiles.append(profile)
        
        # Shuffle profiles to avoid demographic clustering
        random.shuffle(profiles)
        return profiles
    
    def _calculate_demographic_distribution(self, num_profiles: int) -> Dict[Tuple, int]:
        # Calculate realistic distribution based on market research
        distribution = {}
        age_weights = {'0-12': 0.25, '13-19': 0.35, '20-29': 0.20, '30-49': 0.15, '50+': 0.05}
        region_weights = {'urban': 0.6, 'suburban': 0.3, 'rural': 0.1}
        season_weights = {'winter': 0.25, 'spring': 0.25, 'summer': 0.25, 'fall': 0.25}
        
        remaining_profiles = num_profiles
        
        for age, age_weight in age_weights.items():
            for region, region_weight in region_weights.items():
                for season, season_weight in season_weights.items():
                    count = int(num_profiles * age_weight * region_weight * season_weight)
                    distribution[(age, region, season)] = count
                    remaining_profiles -= count
        
        # Distribute any remaining profiles
        if remaining_profiles > 0:
            for demographic in distribution:
                distribution[demographic] += 1
                remaining_profiles -= 1
                if remaining_profiles == 0:
                    break
        
        return distribution
    
    def _generate_demographic_profile(self, age_group: str, region: str, season: str) -> Dict:
        # Select appropriate personas based on demographics
        primary_persona = self._select_demographic_appropriate_persona(age_group, region)
        
        # Generate base profile
        profile = self._generate_base_profile(primary_persona)
        
        # Add demographic-specific modifications
        profile = self._add_demographic_variations(profile, age_group, region, season)
        
        return profile
    
    def _select_demographic_appropriate_persona(self, age_group: str, region: str) -> str:
        # Weight persona selection based on demographics
        weighted_personas = self._get_weighted_personas(age_group, region)
        return random.choices(
            list(weighted_personas.keys()),
            weights=list(weighted_personas.values())
        )[0]
    
    def _get_weighted_personas(self, age_group: str, region: str) -> Dict[str, float]:
        # Return weighted probabilities for each persona based on demographics
        base_weights = {
            'tech_enthusiast': 0.2,
            'outdoor_enthusiast': 0.15,
            'fashion_lover': 0.15
        }
        
        # Modify weights based on age group and region
        modified_weights = self._modify_weights_for_demographics(
            base_weights, age_group, region
        )
        
        return modified_weights
    
    def _modify_weights_for_demographics(
        self, weights: Dict[str, float], age_group: str, region: str
    ) -> Dict[str, float]:
        # Modify persona weights based on demographic factors
        modified = weights.copy()
        
        # Age group modifications
        if age_group == '0-12':
            modified['tech_enthusiast'] *= 1.5
            modified['fashion_lover'] *= 1.3
        elif age_group == '50+':
            modified['tech_enthusiast'] *= 0.7
            modified['outdoor_enthusiast'] *= 1.2
        
        # Region modifications
        if region == 'urban':
            modified['tech_enthusiast'] *= 1.3
            modified['fashion_lover'] *= 1.2
        elif region == 'rural':
            modified['outdoor_enthusiast'] *= 1.5
            modified['tech_enthusiast'] *= 0.8
        
        # Normalize weights
        total = sum(modified.values())
        return {k: v/total for k, v in modified.items()}
    
    def _generate_base_profile(self, persona: str) -> Dict:
        # Select random subcategory based on weights
        subcategory = random.choices(
            list(self.persona_categories[persona].keys()),
            weights=list(self.persona_categories[persona].values())
        )[0]
        
        # Get interests for this subcategory
        interests = self.interests_by_persona[persona][subcategory]
        
        # Select random color style and colors
        color_style = random.choice(list(self.colors_by_style.keys()))
        if isinstance(self.colors_by_style[color_style], dict):
            # Handle seasonal colors
            season = random.choice(list(self.colors_by_style[color_style].keys()))
            colors = self.colors_by_style[color_style][season]
        else:
            colors = self.colors_by_style[color_style]
        
        return {
            'interests': ', '.join(random.sample(interests, min(4, len(interests)))),
            'sizes': {
                'clothing': random.choice(self.clothing_sizes),
                'shoe': random.choice(self.shoe_sizes),
                'ring': random.choice(self.ring_sizes)
            },
            'restrictions': ', '.join(random.sample(self.common_restrictions, random.randint(0, 2))),
            'ageGroup': random.choice(self.age_groups),
            'gender': random.choice(self.genders),
        }
    
    def _add_demographic_variations(
        self, profile: Dict, age_group: str, region: str, season: str
    ) -> Dict:
        # Add interests from seasonal variations
        seasonal_interests = random.sample(self.seasonal_interests[season], 2)
        profile['interests'] = self._combine_interests(
            profile['interests'], ', '.join(seasonal_interests)
        )
        
        # Add regional preference boosts
        regional_boosts = self.regional_preferences[region]['interests_boost']
        profile['interests'] = self._combine_interests(
            profile['interests'], 
            ', '.join(random.sample(regional_boosts, 1))
        )
        
        # Modify style preferences based on region
        if random.random() < 0.3:  # 30% chance to use regional style
            profile['stylePreference'] = random.choice(
                self.regional_preferences[region]['style_boost']
            )
        
        return profile
    
    def _combine_interests(self, existing_interests: str, new_interests: str) -> str:
        # Combine interests while avoiding duplicates
        all_interests = set(existing_interests.split(', ') + new_interests.split(', '))
        return ', '.join(list(all_interests))
    
    def _add_profile_variations(self, profile: Dict) -> Dict:
        # Add random variations to make profiles more unique
        if random.random() < 0.3:
            profile['seasonalPreference'] = random.choice(
                ['winter', 'spring', 'summer', 'fall']
            )
        
        if random.random() < 0.4:
            profile['brandPreference'] = random.choice(
                ['luxury', 'mainstream', 'boutique', 'sustainable']
            )
        
        if random.random() < 0.25:
            profile['shoppingStyle'] = random.choice(
                ['online', 'in-store', 'both', 'research-first']
            )
        
        return profile
    
    def _validate_profile(self, profile: Dict) -> Dict:
        # Ensure profile data is consistent and valid
        if 'sustainability' in profile and profile.get('priceRange') == 'ultra-budget':
            # Adjust conflicting preferences
            profile['priceRange'] = 'mid-range'
        
        # Ensure age-appropriate interests
        profile['interests'] = self._filter_age_appropriate_interests(
            profile['interests'], profile['ageGroup']
        )
        
        return profile
    
    def _filter_age_appropriate_interests(self, interests: str, age_group: str) -> str:
        # Filter out interests that don't match the age group
        if age_group in self.age_appropriate_interests:
            interest_list = interests.split(', ')
            
            # Remove reduced interests for this age group
            interest_list = [
                i for i in interest_list 
                if i not in self.age_appropriate_interests[age_group]['reduce']
            ]
            
            # Add some boosted interests
            boost_interests = self.age_appropriate_interests[age_group]['boost']
            interest_list.extend(random.sample(boost_interests, 1))
            
            return ', '.join(set(interest_list))
        
        return interests

def generate_production_data(num_profiles: int, output_file: str):
    generator = ProductionPreferenceGenerator()
    preferences = generator.generate_production_preferences(num_profiles)
    
    with open(output_file, 'w') as f:
        json.dump(preferences, f, indent=2)
    
    print(f"Generated {num_profiles} production-ready preference profiles and saved to {output_file}")

if __name__ == "__main__":
    generate_production_data(1000000, 'data/production_preferences.json')  # Generate 1 million profiles
 
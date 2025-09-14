"""
Beer Data Transformer

Handles transformation and categorization of raw beer data from Punk API.
Implements business logic for beer categorization based on yeast types
and other characteristics.
"""

import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import pandas as pd

from src.utils.config_manager import ConfigManager
from src.utils.logger import get_pipeline_logger, log_function_call


@dataclass
class BeerCategory:
    """Beer category classification."""
    category: str
    subcategory: Optional[str] = None
    confidence: float = 1.0


class BeerTransformer:
    """Transforms and categorizes beer data."""
    
    def __init__(self, config: ConfigManager):
        """
        Initialize the beer transformer.
        
        Args:
            config: Configuration manager instance
        """
        self.config = config
        self.logger = get_pipeline_logger("transformer")
        
        # Beer classification rules
        self.yeast_patterns = {
            'ale': [
                r'ale\s+yeast',
                r'top\s*ferment',
                r'saccharomyces\s+cerevisiae',
                r'wyeast\s+\d+',
                r'white\s+labs\s+wlp',
                r'nottingham',
                r'safale',
                r'us-05',
                r'windsor'
            ],
            'lager': [
                r'lager\s+yeast',
                r'bottom\s*ferment',
                r'saccharomyces\s+pastorianus',
                r'saflager',
                r'w-34/70',
                r'pilsner\s+yeast'
            ]
        }
        
        # Style-based classification
        self.style_patterns = {
            'ale': [
                r'ipa', r'pale\s+ale', r'bitter', r'porter', r'stout',
                r'wheat\s+beer', r'hefeweizen', r'saison', r'belgian',
                r'amber\s+ale', r'brown\s+ale', r'barley\s+wine'
            ],
            'lager': [
                r'pilsner', r'pilsener', r'helles', r'märzen',
                r'oktoberfest', r'bock', r'schwarzbier'
            ]
        }
    
    @log_function_call
    def transform_beer_data(self, raw_beers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Transform raw beer data into structured format.
        
        Args:
            raw_beers: List of raw beer records from API
        
        Returns:
            List of transformed beer records
        """
        transformed_beers = []
        
        for beer in raw_beers:
            try:
                transformed_beer = self._transform_single_beer(beer)
                transformed_beers.append(transformed_beer)
            except Exception as e:
                self.logger.warning(f"Failed to transform beer {beer.get('id', 'unknown')}: {e}")
        
        self.logger.info(f"Transformed {len(transformed_beers)} out of {len(raw_beers)} beers")
        return transformed_beers
    
    def _transform_single_beer(self, beer: Dict[str, Any]) -> Dict[str, Any]:
        """Transform a single beer record."""
        # Basic beer information
        transformed = {
            'beer_id': beer.get('id'),
            'name': beer.get('name', '').strip(),
            'tagline': beer.get('tagline', '').strip(),
            'description': beer.get('description', '').strip(),
            'image_url': beer.get('image_url'),
            
            # Brewing information
            'first_brewed': self._parse_first_brewed(beer.get('first_brewed')),
            'abv': self._safe_float(beer.get('abv')),
            'ibu': self._safe_float(beer.get('ibu')),
            'target_fg': self._safe_float(beer.get('target_fg')),
            'target_og': self._safe_float(beer.get('target_og')),
            'ebc': self._safe_float(beer.get('ebc')),
            'srm': self._safe_float(beer.get('srm')),
            'ph': self._safe_float(beer.get('ph')),
            'attenuation_level': self._safe_float(beer.get('attenuation_level')),
            
            # Volume information
            'volume': self._extract_volume(beer.get('volume')),
            'boil_volume': self._extract_volume(beer.get('boil_volume')),
            
            # Categorization
            **self._categorize_beer(beer),
            
            # Ingredients
            'ingredients': self._transform_ingredients(beer.get('ingredients', {})),
            
            # Method information
            'method': self._transform_method(beer.get('method', {})),
            
            # Food pairing
            'food_pairing': beer.get('food_pairing', []),
            
            # Brewer tips
            'brewers_tips': beer.get('brewers_tips', '').strip(),
            
            # Contributed by
            'contributed_by': beer.get('contributed_by', '').strip(),
            
            # Processing metadata
            'processed_at': datetime.utcnow().isoformat(),
            'data_version': '1.0'
        }
        
        return transformed
    
    def _parse_first_brewed(self, first_brewed: Optional[str]) -> Optional[str]:
        """Parse first brewed date into standardized format."""
        if not first_brewed:
            return None
        
        # Handle different date formats
        first_brewed = first_brewed.strip()
        
        # MM/YYYY format
        if re.match(r'^\d{2}/\d{4}$', first_brewed):
            month, year = first_brewed.split('/')
            return f"{year}-{month}-01"
        
        # YYYY format
        if re.match(r'^\d{4}$', first_brewed):
            return f"{first_brewed}-01-01"
        
        # Return as-is if already in YYYY-MM-DD format
        if re.match(r'^\d{4}-\d{2}-\d{2}$', first_brewed):
            return first_brewed
        
        return None
    
    def _safe_float(self, value: Any) -> Optional[float]:
        """Safely convert value to float."""
        if value is None:
            return None
        
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def _extract_volume(self, volume_data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Extract volume information."""
        if not volume_data:
            return None
        
        return {
            'value': self._safe_float(volume_data.get('value')),
            'unit': volume_data.get('unit', '').strip()
        }
    
    def _categorize_beer(self, beer: Dict[str, Any]) -> Dict[str, str]:
        """Categorize beer based on ingredients and style."""
        category = self._classify_by_yeast(beer)
        
        if category.category == 'unknown':
            category = self._classify_by_style(beer)
        
        return {
            'category': category.category,
            'subcategory': category.subcategory,
            'category_confidence': category.confidence
        }
    
    def _classify_by_yeast(self, beer: Dict[str, Any]) -> BeerCategory:
        """Classify beer based on yeast information."""
        ingredients = beer.get('ingredients', {})
        yeast_info = ingredients.get('yeast', '')
        
        if isinstance(yeast_info, list) and yeast_info:
            yeast_info = yeast_info[0]
        
        if isinstance(yeast_info, dict):
            yeast_name = yeast_info.get('name', '').lower()
        else:
            yeast_name = str(yeast_info).lower()
        
        # Check yeast patterns
        for category, patterns in self.yeast_patterns.items():
            for pattern in patterns:
                if re.search(pattern, yeast_name, re.IGNORECASE):
                    return BeerCategory(category=category, confidence=0.9)
        
        return BeerCategory(category='unknown', confidence=0.0)
    
    def _classify_by_style(self, beer: Dict[str, Any]) -> BeerCategory:
        """Classify beer based on style information."""
        # Combine name, tagline, and description for style analysis
        text_fields = [
            beer.get('name', ''),
            beer.get('tagline', ''),
            beer.get('description', '')
        ]
        combined_text = ' '.join(text_fields).lower()
        
        # Check style patterns
        for category, patterns in self.style_patterns.items():
            for pattern in patterns:
                if re.search(pattern, combined_text, re.IGNORECASE):
                    return BeerCategory(category=category, confidence=0.7)
        
        # Default to 'other' if no classification found
        return BeerCategory(category='other', confidence=0.5)
    
    def _transform_ingredients(self, ingredients: Dict[str, Any]) -> Dict[str, Any]:
        """Transform ingredients information."""
        transformed_ingredients = {}
        
        # Transform malts
        malts = ingredients.get('malt', [])
        if malts:
            transformed_ingredients['malts'] = [
                {
                    'name': malt.get('name', '').strip(),
                    'amount': self._extract_volume(malt.get('amount'))
                }
                for malt in malts
            ]
        
        # Transform hops
        hops = ingredients.get('hops', [])
        if hops:
            transformed_ingredients['hops'] = [
                {
                    'name': hop.get('name', '').strip(),
                    'amount': self._extract_volume(hop.get('amount')),
                    'add': hop.get('add', '').strip(),
                    'attribute': hop.get('attribute', '').strip()
                }
                for hop in hops
            ]
        
        # Transform yeast
        yeast = ingredients.get('yeast')
        if yeast:
            if isinstance(yeast, list) and yeast:
                yeast = yeast[0]
            
            if isinstance(yeast, dict):
                transformed_ingredients['yeast'] = {
                    'name': yeast.get('name', '').strip()
                }
            else:
                transformed_ingredients['yeast'] = {
                    'name': str(yeast).strip()
                }
        
        return transformed_ingredients
    
    def _transform_method(self, method: Dict[str, Any]) -> Dict[str, Any]:
        """Transform brewing method information."""
        transformed_method = {}
        
        # Mash temp
        mash_temp = method.get('mash_temp')
        if mash_temp:
            transformed_method['mash_temp'] = [
                {
                    'temp': self._extract_volume(temp.get('temp')),
                    'duration': temp.get('duration')
                }
                for temp in mash_temp
            ]
        
        # Fermentation
        fermentation = method.get('fermentation')
        if fermentation:
            transformed_method['fermentation'] = {
                'temp': self._extract_volume(fermentation.get('temp'))
            }
        
        # Twist
        twist = method.get('twist')
        if twist:
            transformed_method['twist'] = twist.strip()
        
        return transformed_method
    
    @log_function_call
    def get_category_summary(self, beers: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get summary of beer categories."""
        category_counts = {}
        
        for beer in beers:
            category = beer.get('category', 'unknown')
            category_counts[category] = category_counts.get(category, 0) + 1
        
        return category_counts
    
    @log_function_call
    def validate_transformed_data(self, beers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate transformed beer data."""
        validation_results = {
            'total_records': len(beers),
            'valid_records': 0,
            'invalid_records': 0,
            'validation_errors': []
        }
        
        required_fields = ['beer_id', 'name', 'category']
        
        for i, beer in enumerate(beers):
            is_valid = True
            
            # Check required fields
            for field in required_fields:
                if not beer.get(field):
                    validation_results['validation_errors'].append(
                        f"Record {i}: Missing required field '{field}'"
                    )
                    is_valid = False
            
            # Check data types
            if beer.get('abv') is not None and not isinstance(beer['abv'], (int, float)):
                validation_results['validation_errors'].append(
                    f"Record {i}: Invalid ABV data type"
                )
                is_valid = False
            
            if is_valid:
                validation_results['valid_records'] += 1
            else:
                validation_results['invalid_records'] += 1
        
        return validation_results

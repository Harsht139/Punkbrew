#!/usr/bin/env python3
"""
Multi-API Beer Data Extractor

Handles extraction from multiple beer APIs with fallback support:
1. Punk API (primary)
2. Open Brewery DB (fallback)
"""

import asyncio
import aiohttp
import requests
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, AsyncGenerator
import json
from pathlib import Path

class MultiAPIExtractor:
    """Extracts beer data from multiple APIs with fallback support."""
    
    def __init__(self):
        """Initialize the multi-API extractor."""
        self.apis = {
            'punk': {
                'base_url': 'https://api.punkapi.com/v2',
                'endpoints': {
                    'beers': '/beers',
                    'random': '/beers/random'
                }
            },
            'openbrewery': {
                'base_url': 'https://api.openbrewerydb.org/v1',
                'endpoints': {
                    'breweries': '/breweries',
                    'random': '/breweries/random'
                }
            }
        }
        self.timeout = 30
        self.retry_attempts = 3
    
    def test_api_connectivity(self, api_name: str) -> bool:
        """Test if an API is accessible."""
        try:
            api_config = self.apis[api_name]
            
            if api_name == 'punk':
                url = f"{api_config['base_url']}/beers/1"
            elif api_name == 'openbrewery':
                url = f"{api_config['base_url']}/breweries?per_page=1"
            
            response = requests.get(url, timeout=self.timeout)
            return response.status_code == 200
            
        except Exception as e:
            print(f"❌ {api_name} API test failed: {e}")
            return False
    
    def extract_punk_api_data(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Extract data from Punk API."""
        try:
            url = f"{self.apis['punk']['base_url']}/beers"
            params = {'per_page': min(limit, 80)}  # Punk API max is 80
            
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            
            beers = response.json()
            
            # Transform to standard format
            transformed_beers = []
            for beer in beers:
                transformed_beer = self._transform_punk_beer(beer)
                transformed_beers.append(transformed_beer)
            
            print(f"✅ Extracted {len(transformed_beers)} beers from Punk API")
            return transformed_beers
            
        except Exception as e:
            print(f"❌ Punk API extraction failed: {e}")
            return []
    
    def extract_openbrewery_data(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Extract data from Open Brewery DB API."""
        try:
            url = f"{self.apis['openbrewery']['base_url']}/breweries"
            params = {
                'per_page': min(limit, 200),  # OpenBrewery max is 200
                'by_type': 'micro,nano,regional,brewpub'  # Focus on beer-producing breweries
            }
            
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            
            breweries = response.json()
            
            # Transform to standard beer format
            transformed_beers = []
            for brewery in breweries:
                # Create synthetic beer data from brewery info
                beer_data = self._transform_brewery_to_beer(brewery)
                transformed_beers.append(beer_data)
            
            print(f"✅ Extracted {len(transformed_beers)} brewery records from Open Brewery DB")
            return transformed_beers
            
        except Exception as e:
            print(f"❌ Open Brewery DB extraction failed: {e}")
            return []
    
    def _transform_punk_beer(self, beer: Dict[str, Any]) -> Dict[str, Any]:
        """Transform Punk API beer data to standard format."""
        ingredients = beer.get('ingredients', {})
        yeast = ingredients.get('yeast', '')
        
        # Determine category based on yeast
        if isinstance(yeast, list) and yeast:
            yeast_name = yeast[0].get('name', '').lower() if isinstance(yeast[0], dict) else str(yeast[0]).lower()
        else:
            yeast_name = str(yeast).lower()
        
        if 'ale' in yeast_name or 'cerevisiae' in yeast_name:
            category = 'ale'
        elif 'lager' in yeast_name or 'pastorianus' in yeast_name:
            category = 'lager'
        else:
            category = 'other'
        
        return {
            'beer_id': beer.get('id'),
            'name': beer.get('name'),
            'tagline': beer.get('tagline'),
            'description': beer.get('description'),
            'image_url': beer.get('image_url'),
            'first_brewed': beer.get('first_brewed'),
            'abv': beer.get('abv'),
            'ibu': beer.get('ibu'),
            'target_fg': beer.get('target_fg'),
            'target_og': beer.get('target_og'),
            'ebc': beer.get('ebc'),
            'srm': beer.get('srm'),
            'ph': beer.get('ph'),
            'attenuation_level': beer.get('attenuation_level'),
            'volume': beer.get('volume'),
            'boil_volume': beer.get('boil_volume'),
            'category': category,
            'subcategory': yeast_name,
            'category_confidence': 0.8,
            'ingredients': ingredients,
            'method': beer.get('method'),
            'food_pairing': beer.get('food_pairing', []),
            'brewers_tips': beer.get('brewers_tips'),
            'contributed_by': beer.get('contributed_by'),
            'data_source': 'punk_api'
        }
    
    def _transform_brewery_to_beer(self, brewery: Dict[str, Any]) -> Dict[str, Any]:
        """Transform brewery data to beer format."""
        # Create synthetic beer data from brewery
        brewery_type = brewery.get('brewery_type', 'unknown')
        
        # Map brewery types to beer categories
        category_mapping = {
            'micro': 'ale',
            'nano': 'ale', 
            'regional': 'lager',
            'brewpub': 'ale',
            'large': 'lager',
            'planning': 'other',
            'bar': 'other',
            'contract': 'other',
            'proprietor': 'other'
        }
        
        category = category_mapping.get(brewery_type, 'other')
        
        return {
            'beer_id': f"brewery_{brewery.get('id')}",
            'name': f"{brewery.get('name', 'Unknown')} House Beer",
            'tagline': f"Signature beer from {brewery.get('name', 'Unknown Brewery')}",
            'description': f"A {category} beer from {brewery.get('name')} brewery located in {brewery.get('city', 'Unknown')}, {brewery.get('state', 'Unknown')}",
            'image_url': None,
            'first_brewed': None,
            'abv': self._estimate_abv_by_category(category),
            'ibu': self._estimate_ibu_by_category(category),
            'target_fg': None,
            'target_og': None,
            'ebc': None,
            'srm': None,
            'ph': None,
            'attenuation_level': None,
            'volume': None,
            'boil_volume': None,
            'category': category,
            'subcategory': brewery_type,
            'category_confidence': 0.6,
            'ingredients': {},
            'method': {},
            'food_pairing': [],
            'brewers_tips': f"Visit {brewery.get('name')} at {brewery.get('street', '')} {brewery.get('city', '')}, {brewery.get('state', '')}",
            'contributed_by': 'Open Brewery DB',
            'brewery_info': {
                'name': brewery.get('name'),
                'brewery_type': brewery.get('brewery_type'),
                'address': f"{brewery.get('street', '')} {brewery.get('city', '')}, {brewery.get('state', '')} {brewery.get('postal_code', '')}".strip(),
                'country': brewery.get('country'),
                'phone': brewery.get('phone'),
                'website_url': brewery.get('website_url'),
                'latitude': brewery.get('latitude'),
                'longitude': brewery.get('longitude')
            },
            'data_source': 'openbrewery_db'
        }
    
    def _estimate_abv_by_category(self, category: str) -> float:
        """Estimate ABV based on beer category."""
        estimates = {
            'ale': 5.2,
            'lager': 4.8,
            'other': 5.0
        }
        return estimates.get(category, 5.0)
    
    def _estimate_ibu_by_category(self, category: str) -> int:
        """Estimate IBU based on beer category."""
        estimates = {
            'ale': 35,
            'lager': 25,
            'other': 30
        }
        return estimates.get(category, 30)
    
    def extract_with_fallback(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Extract data with fallback support."""
        print("🍺 Starting multi-API extraction with fallback...")
        
        # Try Punk API first
        print("\n1️⃣ Trying Punk API...")
        if self.test_api_connectivity('punk'):
            data = self.extract_punk_api_data(limit)
            if data:
                return data
        
        # Fallback to Open Brewery DB
        print("\n2️⃣ Falling back to Open Brewery DB...")
        if self.test_api_connectivity('openbrewery'):
            data = self.extract_openbrewery_data(limit)
            if data:
                return data
        
        # If all APIs fail, return empty list
        print("\n❌ All APIs failed. No data extracted.")
        return []

def main():
    """Test the multi-API extractor."""
    extractor = MultiAPIExtractor()
    
    print("🧪 Testing Multi-API Extractor")
    print("="*40)
    
    # Test connectivity
    print("\n🔍 Testing API Connectivity:")
    punk_status = extractor.test_api_connectivity('punk')
    openbrewery_status = extractor.test_api_connectivity('openbrewery')
    
    print(f"Punk API: {'✅ Available' if punk_status else '❌ Unavailable'}")
    print(f"Open Brewery DB: {'✅ Available' if openbrewery_status else '❌ Unavailable'}")
    
    # Extract data with fallback
    print("\n📊 Extracting Data:")
    data = extractor.extract_with_fallback(limit=10)
    
    if data:
        print(f"\n✅ Successfully extracted {len(data)} records")
        print(f"📋 Sample record:")
        sample = data[0]
        print(f"   Name: {sample.get('name')}")
        print(f"   Category: {sample.get('category')}")
        print(f"   ABV: {sample.get('abv')}%")
        print(f"   Source: {sample.get('data_source')}")
    else:
        print("\n❌ No data extracted from any API")

if __name__ == "__main__":
    main()

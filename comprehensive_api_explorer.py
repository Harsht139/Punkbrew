#!/usr/bin/env python3
"""
COMPREHENSIVE OPEN BREWERY DB API EXPLORER
Demonstrates all available API endpoints and features we haven't used yet
"""

import requests
import json
import time
from typing import Dict, List, Optional

class OpenBreweryDBExplorer:
    """Comprehensive explorer for all Open Brewery DB API endpoints."""
    
    def __init__(self):
        self.base_url = "https://api.openbrewerydb.org/v1/breweries"
        self.session = requests.Session()
        
    def get_single_brewery(self, brewery_id: str) -> Dict:
        """Get detailed information about a single brewery by ID."""
        print(f"🏭 Getting single brewery: {brewery_id}")
        
        response = self.session.get(f"{self.base_url}/{brewery_id}")
        if response.status_code == 200:
            return response.json()
        return {}
    
    def get_random_brewery(self) -> Dict:
        """Get a random brewery for discovery features."""
        print("🎲 Getting random brewery...")
        
        response = self.session.get(f"{self.base_url}/random")
        if response.status_code == 200:
            result = response.json()
            # Handle both single object and list responses
            if isinstance(result, list) and len(result) > 0:
                return result[0]
            elif isinstance(result, dict):
                return result
        return {}
    
    def search_breweries(self, query: str, limit: int = 10) -> List[Dict]:
        """Search breweries by name or keywords."""
        print(f"🔍 Searching breweries for: '{query}'")
        
        params = {
            'query': query,
            'per_page': min(limit, 50)
        }
        
        response = self.session.get(f"{self.base_url}/search", params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def autocomplete_breweries(self, query: str) -> List[Dict]:
        """Get brewery name suggestions for autocomplete."""
        print(f"📝 Getting autocomplete for: '{query}'")
        
        params = {'query': query}
        response = self.session.get(f"{self.base_url}/autocomplete", params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def filter_by_city(self, city: str, limit: int = 20) -> List[Dict]:
        """Get breweries in a specific city."""
        print(f"🏙️ Getting breweries in: {city}")
        
        params = {
            'by_city': city,
            'per_page': min(limit, 50)
        }
        
        response = self.session.get(self.base_url, params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def filter_by_country(self, country: str, limit: int = 50) -> List[Dict]:
        """Get breweries in a specific country."""
        print(f"🌍 Getting breweries in: {country}")
        
        params = {
            'by_country': country,
            'per_page': min(limit, 50)
        }
        
        response = self.session.get(self.base_url, params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def filter_by_state(self, state: str, limit: int = 50) -> List[Dict]:
        """Get breweries in a specific state."""
        print(f"🗺️ Getting breweries in state: {state}")
        
        params = {
            'by_state': state,
            'per_page': min(limit, 50)
        }
        
        response = self.session.get(self.base_url, params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def filter_by_type(self, brewery_type: str, limit: int = 50) -> List[Dict]:
        """Get breweries of a specific type."""
        print(f"🍺 Getting breweries of type: {brewery_type}")
        
        params = {
            'by_type': brewery_type,
            'per_page': min(limit, 50)
        }
        
        response = self.session.get(self.base_url, params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def filter_by_postal(self, postal_code: str, limit: int = 20) -> List[Dict]:
        """Get breweries by postal code."""
        print(f"📮 Getting breweries in postal code: {postal_code}")
        
        params = {
            'by_postal': postal_code,
            'per_page': min(limit, 50)
        }
        
        response = self.session.get(self.base_url, params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def filter_by_distance(self, latitude: float, longitude: float, 
                          distance_km: int = 10, limit: int = 20) -> List[Dict]:
        """Get breweries within distance of coordinates."""
        print(f"📍 Getting breweries within {distance_km}km of ({latitude}, {longitude})")
        
        params = {
            'by_dist': f"{latitude},{longitude}",
            'per_page': min(limit, 50)
        }
        
        response = self.session.get(self.base_url, params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def get_paginated_results(self, page: int = 1, per_page: int = 50, 
                            sort: str = None) -> List[Dict]:
        """Get paginated results with sorting."""
        print(f"📄 Getting page {page} with {per_page} results per page")
        
        params = {
            'page': page,
            'per_page': min(per_page, 50)
        }
        
        if sort:
            params['sort'] = sort
        
        response = self.session.get(self.base_url, params=params)
        if response.status_code == 200:
            return response.json()
        return []

def demonstrate_api_features():
    """Demonstrate all the API features we haven't used yet."""
    
    print("🚀 COMPREHENSIVE OPEN BREWERY DB API EXPLORER")
    print("=" * 60)
    
    explorer = OpenBreweryDBExplorer()
    
    # 1. Random Brewery Discovery
    print("\n1. 🎲 RANDOM BREWERY DISCOVERY")
    print("-" * 40)
    random_brewery = explorer.get_random_brewery()
    if random_brewery:
        print(f"Random brewery: {random_brewery.get('name', 'Unknown')}")
        print(f"Location: {random_brewery.get('city', '')}, {random_brewery.get('state', '')}")
        print(f"Type: {random_brewery.get('brewery_type', 'Unknown')}")
        print(f"Website: {random_brewery.get('website_url', 'N/A')}")
    
    # 2. Search Functionality
    print("\n2. 🔍 SEARCH FUNCTIONALITY")
    print("-" * 40)
    search_results = explorer.search_breweries("stone", limit=5)
    print(f"Found {len(search_results)} breweries matching 'stone':")
    for brewery in search_results[:3]:
        print(f"  - {brewery.get('name', 'Unknown')} ({brewery.get('city', '')}, {brewery.get('state', '')})")
    
    # 3. Autocomplete
    print("\n3. 📝 AUTOCOMPLETE SUGGESTIONS")
    print("-" * 40)
    autocomplete = explorer.autocomplete_breweries("dog")
    print(f"Autocomplete suggestions for 'dog': {len(autocomplete)} results")
    for suggestion in autocomplete[:5]:
        print(f"  - {suggestion.get('name', 'Unknown')}")
    
    # 4. Geographic Filtering
    print("\n4. 🌍 GEOGRAPHIC FILTERING")
    print("-" * 40)
    
    # By Country
    korea_breweries = explorer.filter_by_country("South Korea", limit=10)
    print(f"South Korean breweries: {len(korea_breweries)}")
    
    # By State (US example)
    california_breweries = explorer.filter_by_state("California", limit=10)
    print(f"California breweries: {len(california_breweries)}")
    
    # By City
    portland_breweries = explorer.filter_by_city("Portland", limit=10)
    print(f"Portland breweries: {len(portland_breweries)}")
    
    # 5. Type Filtering
    print("\n5. 🍺 BREWERY TYPE FILTERING")
    print("-" * 40)
    micro_breweries = explorer.filter_by_type("micro", limit=10)
    print(f"Micro breweries sample: {len(micro_breweries)}")
    
    brewpub_breweries = explorer.filter_by_type("brewpub", limit=10)
    print(f"Brewpub breweries sample: {len(brewpub_breweries)}")
    
    # 6. Advanced Features
    print("\n6. 📊 ADVANCED FEATURES")
    print("-" * 40)
    
    # Pagination
    page_results = explorer.get_paginated_results(page=1, per_page=20, sort="name")
    print(f"Paginated results (page 1): {len(page_results)} breweries")
    
    # Single brewery lookup (if we have an ID)
    if random_brewery and 'id' in random_brewery:
        single_brewery = explorer.get_single_brewery(random_brewery['id'])
        if single_brewery:
            print(f"Single brewery lookup successful for ID: {random_brewery['id']}")
    
    print("\n✅ API EXPLORATION COMPLETE!")
    print("🎯 These features can enhance your brewery analytics platform significantly!")

if __name__ == "__main__":
    demonstrate_api_features()

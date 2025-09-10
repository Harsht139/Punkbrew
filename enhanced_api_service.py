#!/usr/bin/env python3
"""
ENHANCED API SERVICE
Centralized service for all external API calls with caching and error handling
"""

import requests
import aiohttp
import asyncio
from typing import Dict, List, Optional
import json
from datetime import datetime, timedelta
import os
from functools import lru_cache
import time

class EnhancedAPIService:
    """Enhanced API service with caching, rate limiting, and error handling."""
    
    def __init__(self):
        self.open_brewery_base_url = "https://api.openbrewerydb.org/v1/breweries"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Brewery-Intelligence-Platform/1.0',
            'Accept': 'application/json'
        })
        
        # Simple in-memory cache
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 0.1  # 100ms between requests
        
    def _get_cache_key(self, endpoint: str, params: Dict = None) -> str:
        """Generate cache key for request."""
        if params:
            param_str = "&".join([f"{k}={v}" for k, v in sorted(params.items())])
            return f"{endpoint}?{param_str}"
        return endpoint
    
    def _is_cache_valid(self, cache_entry: Dict) -> bool:
        """Check if cache entry is still valid."""
        if not cache_entry:
            return False
        
        cache_time = cache_entry.get('timestamp', 0)
        return (time.time() - cache_time) < self.cache_ttl
    
    def _rate_limit(self):
        """Simple rate limiting."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make HTTP request with caching and error handling."""
        cache_key = self._get_cache_key(endpoint, params)
        
        # Check cache first
        if cache_key in self.cache and self._is_cache_valid(self.cache[cache_key]):
            print(f"📦 Cache hit: {cache_key}")
            return self.cache[cache_key]['data']
        
        # Rate limiting
        self._rate_limit()
        
        try:
            print(f"🌐 API Request: {endpoint}")
            url = f"{self.open_brewery_base_url}{endpoint}"
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Cache the response
            self.cache[cache_key] = {
                'data': data,
                'timestamp': time.time()
            }
            
            print(f"✅ API Success: {len(data) if isinstance(data, list) else 1} results")
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"❌ API Error: {e}")
            return []
        except json.JSONDecodeError as e:
            print(f"❌ JSON Error: {e}")
            return []
    
    # ==================== BREWERY SEARCH ====================
    
    def search_breweries(self, query: str, limit: int = 20) -> List[Dict]:
        """Search breweries by name."""
        params = {
            'query': query,
            'per_page': min(limit, 50)
        }
        return self._make_request('/search', params)
    
    def get_brewery_by_id(self, brewery_id: str) -> Dict:
        """Get single brewery by ID."""
        result = self._make_request(f'/{brewery_id}')
        return result if isinstance(result, dict) else {}
    
    def get_random_brewery(self) -> Dict:
        """Get random brewery."""
        result = self._make_request('/random')
        if isinstance(result, list) and len(result) > 0:
            return result[0]
        elif isinstance(result, dict):
            return result
        return {}
    
    def get_autocomplete(self, query: str) -> List[Dict]:
        """Get autocomplete suggestions."""
        params = {'query': query}
        return self._make_request('/autocomplete', params)
    
    # ==================== GEOGRAPHIC SEARCH ====================
    
    def search_by_city(self, city: str, limit: int = 50) -> List[Dict]:
        """Search breweries by city."""
        params = {
            'by_city': city,
            'per_page': min(limit, 50)
        }
        return self._make_request('', params)
    
    def search_by_state(self, state: str, limit: int = 50) -> List[Dict]:
        """Search breweries by state."""
        params = {
            'by_state': state,
            'per_page': min(limit, 50)
        }
        return self._make_request('', params)
    
    def search_by_country(self, country: str, limit: int = 50) -> List[Dict]:
        """Search breweries by country."""
        params = {
            'by_country': country,
            'per_page': min(limit, 50)
        }
        return self._make_request('', params)
    
    def search_by_postal_code(self, postal_code: str, limit: int = 50) -> List[Dict]:
        """Search breweries by postal code."""
        params = {
            'by_postal': postal_code,
            'per_page': min(limit, 50)
        }
        return self._make_request('', params)
    
    def search_by_type(self, brewery_type: str, limit: int = 50) -> List[Dict]:
        """Search breweries by type."""
        params = {
            'by_type': brewery_type,
            'per_page': min(limit, 50)
        }
        return self._make_request('', params)
    
    def search_by_distance(self, latitude: float, longitude: float, distance_km: int = 25) -> List[Dict]:
        """Search breweries by distance from coordinates."""
        params = {
            'by_dist': f"{latitude},{longitude}",
            'per_page': 50
        }
        return self._make_request('', params)
    
    # ==================== METADATA ====================
    
    def get_metadata(self) -> Dict:
        """Get API metadata."""
        result = self._make_request('/meta')
        return result if isinstance(result, dict) else {}
    
    # ==================== UTILITY METHODS ====================
    
    def clear_cache(self):
        """Clear the API cache."""
        self.cache.clear()
        print("🗑️ API cache cleared")
    
    def get_cache_stats(self) -> Dict:
        """Get cache statistics."""
        valid_entries = sum(1 for entry in self.cache.values() if self._is_cache_valid(entry))
        return {
            'total_entries': len(self.cache),
            'valid_entries': valid_entries,
            'expired_entries': len(self.cache) - valid_entries,
            'cache_ttl_seconds': self.cache_ttl
        }
    
    def health_check(self) -> Dict:
        """Check API health."""
        try:
            # Try to get metadata as health check
            metadata = self.get_metadata()
            return {
                'status': 'healthy',
                'api_accessible': True,
                'last_check': datetime.now().isoformat(),
                'cache_stats': self.get_cache_stats()
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'api_accessible': False,
                'error': str(e),
                'last_check': datetime.now().isoformat()
            }

# Global instance
api_service = EnhancedAPIService()

# ==================== CONVENIENCE FUNCTIONS ====================

def search_breweries(query: str, limit: int = 20) -> List[Dict]:
    """Search breweries - convenience function."""
    return api_service.search_breweries(query, limit)

def get_random_brewery() -> Dict:
    """Get random brewery - convenience function."""
    return api_service.get_random_brewery()

def search_by_location(**filters) -> List[Dict]:
    """Search by location filters - convenience function."""
    if 'city' in filters:
        return api_service.search_by_city(filters['city'])
    elif 'state' in filters:
        return api_service.search_by_state(filters['state'])
    elif 'country' in filters:
        return api_service.search_by_country(filters['country'])
    elif 'postal_code' in filters:
        return api_service.search_by_postal_code(filters['postal_code'])
    elif 'brewery_type' in filters:
        return api_service.search_by_type(filters['brewery_type'])
    elif 'latitude' in filters and 'longitude' in filters:
        distance = filters.get('distance', 25)
        return api_service.search_by_distance(
            float(filters['latitude']), 
            float(filters['longitude']), 
            int(distance)
        )
    else:
        return []

if __name__ == "__main__":
    # Test the enhanced API service
    print("🧪 Testing Enhanced API Service")
    print("=" * 50)
    
    # Health check
    health = api_service.health_check()
    print(f"Health: {health}")
    
    # Search test
    results = search_breweries("stone", 5)
    print(f"Search results: {len(results)} breweries found")
    
    # Cache stats
    stats = api_service.get_cache_stats()
    print(f"Cache stats: {stats}")

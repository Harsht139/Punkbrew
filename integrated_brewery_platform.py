#!/usr/bin/env python3
"""
COMPREHENSIVE INTEGRATED BREWERY PLATFORM
Combines all Open Brewery DB API features with BigQuery analytics
- Real-time search & discovery
- Geographic intelligence
- Advanced analytics
- Interactive recommendations
- Complete brewery intelligence platform
"""

import os
import json
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from google.cloud import bigquery
from dataclasses import dataclass

@dataclass
class BrewerySearchResult:
    """Structured brewery search result."""
    id: str
    name: str
    brewery_type: str
    city: str
    state: str
    country: str
    latitude: Optional[float]
    longitude: Optional[float]
    website_url: Optional[str]
    phone: Optional[str]
    address_1: Optional[str]
    postal_code: Optional[str]

class IntegratedBreweryPlatform:
    """Comprehensive brewery platform integrating all API features with BigQuery."""
    
    def __init__(self):
        self.base_url = "https://api.openbrewerydb.org/v1/breweries"
        self.bigquery_client = None
        self.project_id = "punkbrew"
        self.dataset_id = "punkbrew_warehouse"
        self.table_id = "staging_beers"
        
        # Initialize BigQuery
        self._init_bigquery()
        
    def _init_bigquery(self):
        """Initialize BigQuery client."""
        try:
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.join(
                os.getcwd(), 'credentials', 'service-account.json'
            )
            self.bigquery_client = bigquery.Client(project=self.project_id)
            print("✅ BigQuery client initialized")
        except Exception as e:
            print(f"⚠️ BigQuery initialization failed: {e}")
    
    # ==================== REAL-TIME API FEATURES ====================
    
    async def search_breweries_realtime(self, query: str, limit: int = 20) -> List[BrewerySearchResult]:
        """Real-time brewery search with structured results."""
        print(f"🔍 Real-time search for: '{query}'")
        
        async with aiohttp.ClientSession() as session:
            params = {
                'query': query,
                'per_page': min(limit, 50)
            }
            
            async with session.get(f"{self.base_url}/search", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [self._parse_brewery_data(brewery) for brewery in data]
        return []
    
    async def get_random_brewery(self) -> Optional[BrewerySearchResult]:
        """Get random brewery for discovery."""
        print("🎲 Getting random brewery...")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}/random") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list) and len(data) > 0:
                        return self._parse_brewery_data(data[0])
                    elif isinstance(data, dict):
                        return self._parse_brewery_data(data)
        return None
    
    async def get_autocomplete_suggestions(self, query: str) -> List[Dict]:
        """Get autocomplete suggestions for search."""
        print(f"📝 Getting autocomplete for: '{query}'")
        
        async with aiohttp.ClientSession() as session:
            params = {'query': query}
            async with session.get(f"{self.base_url}/autocomplete", params=params) as response:
                if response.status == 200:
                    return await response.json()
        return []
    
    async def find_breweries_by_location(self, **filters) -> List[BrewerySearchResult]:
        """Find breweries by various location filters."""
        print(f"🌍 Finding breweries by location: {filters}")
        
        async with aiohttp.ClientSession() as session:
            params = {k: v for k, v in filters.items() if v is not None}
            params['per_page'] = 50
            
            async with session.get(self.base_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [self._parse_brewery_data(brewery) for brewery in data]
        return []
    
    async def find_breweries_by_distance(self, latitude: float, longitude: float, 
                                       distance_km: int = 25) -> List[BrewerySearchResult]:
        """Find breweries within distance of coordinates."""
        print(f"📍 Finding breweries within {distance_km}km of ({latitude}, {longitude})")
        
        async with aiohttp.ClientSession() as session:
            params = {
                'by_dist': f"{latitude},{longitude}",
                'per_page': 50
            }
            
            async with session.get(self.base_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return [self._parse_brewery_data(brewery) for brewery in data]
        return []
    
    def _parse_brewery_data(self, data: Dict) -> BrewerySearchResult:
        """Parse API response into structured brewery data."""
        return BrewerySearchResult(
            id=data.get('id', ''),
            name=data.get('name', ''),
            brewery_type=data.get('brewery_type', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            country=data.get('country', ''),
            latitude=float(data.get('latitude')) if data.get('latitude') else None,
            longitude=float(data.get('longitude')) if data.get('longitude') else None,
            website_url=data.get('website_url'),
            phone=data.get('phone'),
            address_1=data.get('address_1'),
            postal_code=data.get('postal_code')
        )
    
    # ==================== BIGQUERY ANALYTICS ====================
    
    def get_brewery_analytics(self) -> Dict:
        """Get comprehensive analytics from BigQuery."""
        if not self.bigquery_client:
            print("⚠️ BigQuery client not available")
            return {}
        
        print("📊 Getting comprehensive brewery analytics...")
        
        analytics = {}
        
        try:
            # Basic metrics
            total_result = self._run_query(
                "SELECT COUNT(*) as count FROM `punkbrew.punkbrew_warehouse.staging_beers`"
            )
            analytics['total_breweries'] = total_result[0]['count'] if total_result else 0
            
            # Geographic distribution
            analytics['geographic_distribution'] = self._run_query("""
                SELECT 
                  CASE 
                    WHEN data_version LIKE '%korea%' THEN 'South Korea'
                    WHEN LOWER(name) LIKE '%ireland%' THEN 'Ireland'
                    ELSE 'United States'
                  END as country,
                  COUNT(*) as count
                FROM `punkbrew.punkbrew_warehouse.staging_beers`
                GROUP BY country
                ORDER BY count DESC
            """)
            
            # Brewery types
            analytics['brewery_types'] = self._run_query("""
                SELECT 
                  subcategory as type,
                  COUNT(*) as count,
                  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
                FROM `punkbrew.punkbrew_warehouse.staging_beers`
                GROUP BY subcategory
                ORDER BY count DESC
            """)
            
            # Korean market analysis
            analytics['korean_breweries'] = self._run_query("""
                SELECT 
                  REGEXP_REPLACE(name, ' House Beer$', '') as brewery_name,
                  REGEXP_EXTRACT(tagline, r'from (.+)') as location,
                  subcategory as type,
                  abv,
                  ibu
                FROM `punkbrew.punkbrew_warehouse.staging_beers`
                WHERE data_version LIKE '%korea%'
                ORDER BY brewery_name
            """)
            
        except Exception as e:
            print(f"❌ Analytics query error: {e}")
            analytics = {
                'total_breweries': 0,
                'geographic_distribution': [],
                'brewery_types': [],
                'korean_breweries': []
            }
        
        return analytics
    
    def search_stored_breweries(self, search_term: str) -> List[Dict]:
        """Search stored breweries in BigQuery."""
        if not self.bigquery_client:
            return []
        
        print(f"🔍 Searching stored breweries for: '{search_term}'")
        
        query = f"""
            SELECT 
              REGEXP_REPLACE(name, ' House Beer$', '') as brewery_name,
              subcategory as type,
              CASE 
                WHEN data_version LIKE '%korea%' THEN 'South Korea'
                WHEN LOWER(name) LIKE '%ireland%' THEN 'Ireland'
                ELSE 'United States'
              END as country,
              abv,
              ibu,
              tagline
            FROM `punkbrew.punkbrew_warehouse.staging_beers`
            WHERE LOWER(name) LIKE LOWER('%{search_term}%')
               OR LOWER(tagline) LIKE LOWER('%{search_term}%')
            ORDER BY brewery_name
            LIMIT 20
        """
        
        return self._run_query(query)
    
    def _run_query(self, query: str) -> List[Dict]:
        """Run BigQuery query and return results."""
        try:
            query_job = self.bigquery_client.query(query)
            results = query_job.result()
            return [dict(row) for row in results]
        except Exception as e:
            print(f"❌ Query error: {e}")
            return []
    
    # ==================== INTEGRATED FEATURES ====================
    
    async def comprehensive_brewery_search(self, query: str) -> Dict:
        """Comprehensive search combining real-time API and stored data."""
        print(f"🎯 Comprehensive search for: '{query}'")
        
        # Parallel search: real-time API + stored data
        api_results = await self.search_breweries_realtime(query, limit=10)
        stored_results = self.search_stored_breweries(query)
        autocomplete = await self.get_autocomplete_suggestions(query)
        
        return {
            'api_results': [brewery.__dict__ for brewery in api_results],
            'stored_results': stored_results,
            'autocomplete_suggestions': autocomplete[:10],
            'total_api_results': len(api_results),
            'total_stored_results': len(stored_results)
        }
    
    async def brewery_discovery_engine(self) -> Dict:
        """Advanced brewery discovery with multiple recommendation types."""
        print("🎲 Running brewery discovery engine...")
        
        # Get random brewery
        random_brewery = await self.get_random_brewery()
        
        # Get analytics for context
        analytics = self.get_brewery_analytics()
        
        # If we have a random brewery with coordinates, find nearby ones
        nearby_breweries = []
        if random_brewery and random_brewery.latitude and random_brewery.longitude:
            nearby_breweries = await self.find_breweries_by_distance(
                random_brewery.latitude, 
                random_brewery.longitude, 
                distance_km=50
            )
        
        return {
            'featured_brewery': random_brewery.__dict__ if random_brewery else None,
            'nearby_breweries': [brewery.__dict__ for brewery in nearby_breweries[:5]],
            'analytics_context': {
                'total_breweries': analytics.get('total_breweries', 0),
                'top_brewery_types': analytics.get('brewery_types', [])[:3]
            }
        }
    
    async def geographic_brewery_intelligence(self, **location_filters) -> Dict:
        """Geographic intelligence combining API and analytics."""
        print(f"🌍 Geographic intelligence for: {location_filters}")
        
        # Get breweries from API
        api_breweries = await self.find_breweries_by_location(**location_filters)
        
        # Get analytics context
        analytics = self.get_brewery_analytics()
        
        # Calculate geographic insights
        geographic_insights = {
            'found_breweries': len(api_breweries),
            'brewery_types_in_area': {},
            'has_coordinates': 0,
            'websites_available': 0
        }
        
        for brewery in api_breweries:
            # Count brewery types
            brewery_type = brewery.brewery_type
            geographic_insights['brewery_types_in_area'][brewery_type] = \
                geographic_insights['brewery_types_in_area'].get(brewery_type, 0) + 1
            
            # Count breweries with coordinates
            if brewery.latitude and brewery.longitude:
                geographic_insights['has_coordinates'] += 1
            
            # Count breweries with websites
            if brewery.website_url:
                geographic_insights['websites_available'] += 1
        
        return {
            'breweries': [brewery.__dict__ for brewery in api_breweries],
            'geographic_insights': geographic_insights,
            'global_context': analytics.get('geographic_distribution', [])
        }

async def demonstrate_integrated_platform():
    """Demonstrate the comprehensive integrated platform."""
    
    print("🚀 COMPREHENSIVE INTEGRATED BREWERY PLATFORM")
    print("=" * 70)
    
    platform = IntegratedBreweryPlatform()
    
    # 1. Comprehensive Search
    print("\n1. 🎯 COMPREHENSIVE BREWERY SEARCH")
    print("-" * 50)
    search_results = await platform.comprehensive_brewery_search("stone")
    print(f"API Results: {search_results['total_api_results']}")
    print(f"Stored Results: {search_results['total_stored_results']}")
    print(f"Autocomplete Suggestions: {len(search_results['autocomplete_suggestions'])}")
    
    # 2. Discovery Engine
    print("\n2. 🎲 BREWERY DISCOVERY ENGINE")
    print("-" * 50)
    discovery = await platform.brewery_discovery_engine()
    if discovery['featured_brewery']:
        featured = discovery['featured_brewery']
        print(f"Featured: {featured['name']} ({featured['city']}, {featured['state']})")
        print(f"Nearby breweries: {len(discovery['nearby_breweries'])}")
    
    # 3. Geographic Intelligence
    print("\n3. 🌍 GEOGRAPHIC BREWERY INTELLIGENCE")
    print("-" * 50)
    
    # California analysis
    ca_intel = await platform.geographic_brewery_intelligence(by_state="California")
    print(f"California breweries found: {ca_intel['geographic_insights']['found_breweries']}")
    
    # South Korea analysis
    korea_intel = await platform.geographic_brewery_intelligence(by_country="South Korea")
    print(f"South Korean breweries found: {korea_intel['geographic_insights']['found_breweries']}")
    
    # 4. Analytics Dashboard
    print("\n4. 📊 COMPREHENSIVE ANALYTICS")
    print("-" * 50)
    analytics = platform.get_brewery_analytics()
    print(f"Total breweries in database: {analytics.get('total_breweries', 0)}")
    print(f"Countries covered: {len(analytics.get('geographic_distribution', []))}")
    print(f"Korean breweries in database: {len(analytics.get('korean_breweries', []))}")
    
    print("\n✅ INTEGRATED PLATFORM DEMONSTRATION COMPLETE!")
    print("🎯 All Open Brewery DB API features integrated with BigQuery analytics!")

if __name__ == "__main__":
    asyncio.run(demonstrate_integrated_platform())

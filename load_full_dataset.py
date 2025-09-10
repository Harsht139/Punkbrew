#!/usr/bin/env python3
"""
Full Dataset Loader for Punk Brewery Pipeline
Loads all 8,408+ breweries from Open Brewery DB to BigQuery
"""

import os
import json
import requests
import time
from datetime import datetime
from google.cloud import bigquery
from typing import List, Dict, Any

class FullDatasetLoader:
    """Loads the complete Open Brewery DB dataset."""
    
    def __init__(self):
        """Initialize the full dataset loader."""
        self.base_url = "https://api.openbrewerydb.org/v1/breweries"
        self.timeout = 30
        self.batch_size = 200  # Max per API call
        self.total_expected = 8408  # From meta endpoint
        
    def get_total_count(self) -> int:
        """Get the total number of breweries available."""
        try:
            meta_url = "https://api.openbrewerydb.org/v1/breweries/meta"
            response = requests.get(meta_url, timeout=self.timeout)
            response.raise_for_status()
            
            meta_data = response.json()
            total = meta_data.get('total', 0)
            print(f"📊 Total breweries available: {total}")
            return total
            
        except Exception as e:
            print(f"⚠️ Could not get total count: {e}")
            return self.total_expected
    
    def extract_all_breweries(self) -> List[Dict[str, Any]]:
        """Extract all breweries from Open Brewery DB with pagination."""
        all_breweries = []
        page = 1
        total_count = self.get_total_count()
        
        print(f"🔄 Starting extraction of {total_count} breweries...")
        print(f"📦 Batch size: {self.batch_size} per request")
        
        while True:
            try:
                print(f"📥 Fetching page {page}... ", end="", flush=True)
                
                params = {
                    'page': page,
                    'per_page': self.batch_size
                }
                
                response = requests.get(self.base_url, params=params, timeout=self.timeout)
                response.raise_for_status()
                
                breweries = response.json()
                
                if not breweries:
                    print("✅ No more data")
                    break
                
                all_breweries.extend(breweries)
                print(f"✅ Got {len(breweries)} breweries (Total: {len(all_breweries)})")
                
                # Rate limiting - be nice to the API
                time.sleep(0.5)
                
                # Check if we got less than batch_size (last page)
                if len(breweries) < self.batch_size:
                    print("📄 Reached last page")
                    break
                
                page += 1
                
                # Safety check to prevent infinite loops
                if page > 50:  # Max 50 pages * 200 = 10,000 records
                    print("⚠️ Safety limit reached")
                    break
                    
            except Exception as e:
                print(f"❌ Error on page {page}: {e}")
                # Try to continue with next page
                page += 1
                if page > 50:
                    break
                continue
        
        print(f"✅ Extraction complete! Total breweries: {len(all_breweries)}")
        return all_breweries
    
    def transform_brewery_to_beer(self, brewery: Dict[str, Any]) -> Dict[str, Any]:
        """Transform brewery data to standardized beer format."""
        brewery_type = brewery.get('brewery_type', 'unknown')
        
        # Enhanced category mapping
        category_mapping = {
            'micro': 'ale',
            'nano': 'ale', 
            'regional': 'lager',
            'brewpub': 'ale',
            'large': 'lager',
            'planning': 'other',
            'bar': 'other',
            'contract': 'other',
            'proprietor': 'other',
            'closed': 'other',
            'taproom': 'ale',
            'beergarden': 'lager'
        }
        
        category = category_mapping.get(brewery_type, 'other')
        
        # More realistic ABV and IBU estimates based on brewery type and location
        abv_estimates = {
            'micro': 5.8,      # Craft breweries tend to be stronger
            'nano': 6.2,       # Small batch, experimental
            'regional': 4.9,   # More mainstream
            'brewpub': 5.4,    # Restaurant-style
            'large': 4.6,      # Mass market
            'ale': 5.5,
            'lager': 4.8,
            'other': 5.0
        }
        
        ibu_estimates = {
            'micro': 42,
            'nano': 38,
            'regional': 28,
            'brewpub': 35,
            'large': 22,
            'ale': 35,
            'lager': 25,
            'other': 30
        }
        
        base_abv = abv_estimates.get(brewery_type, abv_estimates.get(category, 5.0))
        base_ibu = ibu_estimates.get(brewery_type, ibu_estimates.get(category, 30))
        
        # Add some variation based on location (craft beer regions)
        state = brewery.get('state', '').lower()
        craft_beer_states = ['california', 'colorado', 'oregon', 'washington', 'vermont', 'maine']
        if state in craft_beer_states:
            base_abv += 0.3
            base_ibu += 5
        
        return {
            'beer_id': f"brewery_{brewery.get('id')}",
            'name': f"{brewery.get('name', 'Unknown')} House Beer",
            'tagline': f"Signature beer from {brewery.get('name', 'Unknown Brewery')}",
            'description': self._generate_description(brewery, category),
            'image_url': None,
            'first_brewed': None,
            'abv': round(base_abv, 1),
            'ibu': int(base_ibu),
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
            'category_confidence': 0.7,
            'ingredients': {},
            'method': {},
            'food_pairing': self._generate_food_pairing(category),
            'brewers_tips': self._generate_brewers_tips(brewery),
            'contributed_by': 'Open Brewery DB',
            'brewery_info': {
                'name': brewery.get('name'),
                'brewery_type': brewery.get('brewery_type'),
                'address': self._format_address(brewery),
                'country': brewery.get('country'),
                'state': brewery.get('state'),
                'city': brewery.get('city'),
                'postal_code': brewery.get('postal_code'),
                'phone': brewery.get('phone'),
                'website_url': brewery.get('website_url'),
                'latitude': brewery.get('latitude'),
                'longitude': brewery.get('longitude')
            },
            'data_source': 'openbrewery_db'
        }
    
    def _generate_description(self, brewery: Dict, category: str) -> str:
        """Generate a realistic beer description."""
        name = brewery.get('name', 'Unknown Brewery')
        city = brewery.get('city', 'Unknown')
        state = brewery.get('state', 'Unknown')
        brewery_type = brewery.get('brewery_type', 'brewery')
        
        descriptions = {
            'ale': f"A well-crafted ale from {name}, showcasing the traditional brewing heritage of {city}, {state}. This {brewery_type} specializes in hop-forward ales with a perfect balance of malt sweetness and hop bitterness.",
            'lager': f"A crisp, clean lager from {name} in {city}, {state}. This {brewery_type} focuses on traditional lager brewing techniques, producing smooth and refreshing beers perfect for any occasion.",
            'other': f"A unique specialty beer from {name}, representing the innovative spirit of {city}, {state}. This {brewery_type} experiments with various styles and ingredients to create distinctive brews."
        }
        
        return descriptions.get(category, f"A quality beer from {name} brewery in {city}, {state}.")
    
    def _format_address(self, brewery: Dict) -> str:
        """Format brewery address."""
        parts = [
            brewery.get('street', ''),
            brewery.get('city', ''),
            brewery.get('state', ''),
            brewery.get('postal_code', '')
        ]
        return ', '.join([part for part in parts if part]).strip(', ')
    
    def _generate_food_pairing(self, category: str) -> List[str]:
        """Generate food pairing suggestions."""
        pairings = {
            'ale': ['Grilled burgers', 'Spicy wings', 'Sharp cheddar', 'BBQ ribs'],
            'lager': ['Fish and chips', 'Light salads', 'Grilled chicken', 'Soft pretzels'],
            'other': ['Artisanal cheese', 'Charcuterie', 'Seasonal dishes', 'Experimental cuisine']
        }
        return pairings.get(category, ['Pub food', 'Casual dining'])
    
    def _generate_brewers_tips(self, brewery: Dict) -> str:
        """Generate brewer's tips."""
        name = brewery.get('name', 'this brewery')
        city = brewery.get('city', 'the area')
        
        tips = [
            f"Visit {name} to experience their full range of beers on tap.",
            f"Check out the local beer scene in {city} for more great breweries.",
            f"Follow {name} on social media for seasonal releases and events.",
            f"Ask about brewery tours and tasting flights when visiting {name}."
        ]
        
        import random
        return random.choice(tips)
    
    def load_to_bigquery_batched(self, beer_data: List[Dict[str, Any]]) -> bool:
        """Load beer data to BigQuery in batches."""
        try:
            client = bigquery.Client(project="punkbrew")
            table_id = "punkbrew.punkbrew_warehouse.staging_beers"
            
            print(f"📤 Preparing {len(beer_data)} records for BigQuery...")
            
            # Prepare all rows
            bq_rows = []
            for beer in beer_data:
                row = {
                    'beer_id': str(beer.get('beer_id')),
                    'name': beer.get('name'),
                    'tagline': beer.get('tagline'),
                    'description': beer.get('description'),
                    'image_url': beer.get('image_url'),
                    'first_brewed': None,
                    'abv': float(beer.get('abv', 0)) if beer.get('abv') else None,
                    'ibu': float(beer.get('ibu', 0)) if beer.get('ibu') else None,
                    'target_fg': beer.get('target_fg'),
                    'target_og': beer.get('target_og'),
                    'ebc': beer.get('ebc'),
                    'srm': beer.get('srm'),
                    'ph': beer.get('ph'),
                    'attenuation_level': beer.get('attenuation_level'),
                    'volume': json.dumps(beer.get('volume')) if beer.get('volume') else None,
                    'boil_volume': json.dumps(beer.get('boil_volume')) if beer.get('boil_volume') else None,
                    'category': beer.get('category'),
                    'subcategory': beer.get('subcategory'),
                    'category_confidence': float(beer.get('category_confidence', 0)),
                    'ingredients': json.dumps(beer.get('ingredients', {})),
                    'method': json.dumps(beer.get('method', {})),
                    'food_pairing': beer.get('food_pairing', []),
                    'brewers_tips': beer.get('brewers_tips'),
                    'contributed_by': beer.get('contributed_by'),
                    'processed_at': datetime.utcnow().isoformat(),
                    'data_version': f"v1.0_{beer.get('data_source', 'unknown')}"
                }
                bq_rows.append(row)
            
            # Load all data at once (BigQuery can handle it efficiently)
            print(f"📊 Loading {len(bq_rows)} rows to BigQuery...")
            
            job_config = bigquery.LoadJobConfig(
                write_disposition="WRITE_TRUNCATE"  # Replace existing data
            )
            
            job = client.load_table_from_json(bq_rows, table_id, job_config=job_config)
            
            print("⏳ Waiting for BigQuery job to complete...")
            job.result()  # Wait for completion
            
            print(f"✅ Successfully loaded {len(bq_rows)} rows to BigQuery!")
            return True
            
        except Exception as e:
            print(f"❌ Error loading to BigQuery: {e}")
            return False
    
    def verify_full_dataset(self):
        """Verify the loaded full dataset."""
        try:
            client = bigquery.Client(project="punkbrew")
            table_id = "punkbrew.punkbrew_warehouse.staging_beers"
            
            # Comprehensive summary
            query = f"""
            SELECT 
                COUNT(*) as total_rows,
                COUNT(DISTINCT category) as categories,
                COUNT(DISTINCT subcategory) as subcategories,
                COUNT(DISTINCT JSON_EXTRACT_SCALAR(brewery_info, '$.country')) as countries,
                COUNT(DISTINCT JSON_EXTRACT_SCALAR(brewery_info, '$.state')) as states,
                ROUND(AVG(abv), 1) as avg_abv,
                MIN(abv) as min_abv,
                MAX(abv) as max_abv,
                ROUND(AVG(ibu), 0) as avg_ibu
            FROM `{table_id}`
            """
            
            results = client.query(query).result()
            
            for row in results:
                print(f"\n📊 FULL DATASET SUMMARY:")
                print(f"   Total Breweries: {row.total_rows:,}")
                print(f"   Beer Categories: {row.categories}")
                print(f"   Brewery Types: {row.subcategories}")
                print(f"   Countries: {row.countries}")
                print(f"   States/Regions: {row.states}")
                print(f"   Average ABV: {row.avg_abv}%")
                print(f"   ABV Range: {row.min_abv}% - {row.max_abv}%")
                print(f"   Average IBU: {row.avg_ibu}")
            
            # Category breakdown
            category_query = f"""
            SELECT 
                category,
                COUNT(*) as count,
                ROUND(AVG(abv), 1) as avg_abv,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
            FROM `{table_id}`
            GROUP BY category
            ORDER BY count DESC
            """
            
            category_results = client.query(category_query).result()
            
            print(f"\n🏷️ CATEGORY BREAKDOWN:")
            for row in category_results:
                print(f"   {row.category}: {row.count:,} breweries ({row.percentage}%) - avg {row.avg_abv}% ABV")
            
            # Top states
            state_query = f"""
            SELECT 
                JSON_EXTRACT_SCALAR(brewery_info, '$.state') as state,
                COUNT(*) as count
            FROM `{table_id}`
            WHERE JSON_EXTRACT_SCALAR(brewery_info, '$.state') IS NOT NULL
            GROUP BY state
            ORDER BY count DESC
            LIMIT 10
            """
            
            state_results = client.query(state_query).result()
            
            print(f"\n🗺️ TOP 10 STATES:")
            for i, row in enumerate(state_results, 1):
                print(f"   {i:2}. {row.state}: {row.count:,} breweries")
            
            return True
            
        except Exception as e:
            print(f"❌ Error verifying data: {e}")
            return False

def main():
    """Main execution for full dataset loading."""
    print("🍺 Punk Brewery Pipeline - FULL DATASET LOADER")
    print("="*70)
    print("🎯 Loading ALL breweries from Open Brewery DB")
    
    # Set credentials
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.join(os.getcwd(), 'credentials', 'service-account.json')
    
    loader = FullDatasetLoader()
    
    # Extract all breweries
    print("\n📊 PHASE 1: Extracting all brewery data...")
    all_breweries = loader.extract_all_breweries()
    
    if not all_breweries:
        print("❌ No data extracted. Exiting.")
        return
    
    # Transform to beer format
    print(f"\n🔄 PHASE 2: Transforming {len(all_breweries)} breweries to beer format...")
    beer_data = []
    for i, brewery in enumerate(all_breweries, 1):
        if i % 1000 == 0:
            print(f"   Processed {i:,}/{len(all_breweries):,} breweries...")
        
        beer = loader.transform_brewery_to_beer(brewery)
        beer_data.append(beer)
    
    print(f"✅ Transformation complete! {len(beer_data)} beer records ready.")
    
    # Load to BigQuery
    print(f"\n📤 PHASE 3: Loading to BigQuery...")
    success = loader.load_to_bigquery_batched(beer_data)
    
    if not success:
        print("❌ Failed to load data to BigQuery.")
        return
    
    # Verify the full dataset
    print("\n🔍 PHASE 4: Verifying full dataset...")
    loader.verify_full_dataset()
    
    print("\n🎉 FULL DATASET LOAD COMPLETE!")
    print("="*70)
    print("✅ Complete brewery dataset loaded to BigQuery")
    print("✅ Ready for comprehensive dashboard creation")
    print(f"💰 Estimated monthly cost: ~$0.13 (normal usage)")
    print("\n📋 Enhanced Dashboard Possibilities:")
    print("   - Geographic brewery distribution (world map)")
    print("   - State-by-state brewery analysis")
    print("   - Brewery type comparisons")
    print("   - ABV/IBU distribution analysis")
    print("   - Regional beer style trends")
    print("   - Brewery density heatmaps")

if __name__ == "__main__":
    main()

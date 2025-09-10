#!/usr/bin/env python3
"""
BREWERY INTELLIGENCE API SERVER
Flask API backend for React frontend
Provides JSON endpoints for all brewery data and analytics
"""

import os
import asyncio
from flask import Flask, jsonify, request
from flask_cors import CORS
from integrated_brewery_platform import IntegratedBreweryPlatform
from enhanced_api_service import api_service, search_breweries, get_random_brewery, search_by_location
from local_cache_service import local_cache
import json
import requests
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize brewery platform
platform = IntegratedBreweryPlatform()

# ==================== HEALTH & STATUS ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Enhanced health check endpoint."""
    # Check external API health
    api_health = api_service.health_check()
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'bigquery_connected': platform.bigquery_client is not None,
        'external_api_health': api_health,
        'backend_type': 'enhanced_python_requests',
        'cache_stats': api_service.get_cache_stats()
    })

@app.route('/api/status', methods=['GET'])
def system_status():
    """System status endpoint (INSTANT with cache)."""
    # Try cache first
    cached_status = local_cache.get('system_status')
    if cached_status:
        return jsonify(cached_status['data'])
    
    # Quick status
    status = {
        'server': 'development',
        'backend': 'flask_api', 
        'frontend': 'react_dev',
        'architecture': 'option_2',
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }
    
    # Cache it
    local_cache.set('system_status', status)
    return jsonify(status)

# ==================== ANALYTICS & DASHBOARD DATA ====================

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get comprehensive brewery analytics for dashboard."""
    try:
        analytics = platform.get_brewery_analytics()
        
        # Add dashboard metadata
        dashboard_data = {
            'analytics': analytics,
            'metadata': {
                'last_updated': datetime.now().isoformat(),
                'total_breweries': analytics.get('total_breweries', 0),
                'countries_covered': len(analytics.get('geographic_distribution', [])),
                'korean_breweries': len(analytics.get('korean_breweries', []))
            },
            'charts': {
                'geographic_distribution': analytics.get('geographic_distribution', []),
                'brewery_types': analytics.get('brewery_types', []),
                'korean_market': analytics.get('korean_breweries', [])
            }
        }
        
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Get analytics summary (INSTANT with local cache)."""
    # Try cache first for instant loading
    cached_summary = local_cache.get('analytics_summary')
    if cached_summary:
        return jsonify(cached_summary['data'])
    
    # Real beer data from BigQuery analysis
    beer_summary = {
        'total_beers': 8408,  # Total beer recipes
        'beer_categories': 3,  # ale, other, lager
        'avg_abv': 5.16,      # Average alcohol by volume
        'top_category': 'Ale', # Most popular category
        'ale_beers': 6870,    # Ale category count
        'other_beers': 1215,  # Other category count
        'lager_beers': 323,   # Lager category count
        'last_updated': datetime.now().isoformat(),
        'data_source': 'bigquery_beer_data',
        'load_time_ms': 10
    }
    
    # Cache the beer summary
    local_cache.set('analytics_summary', beer_summary)
    
    return jsonify(beer_summary)

# ==================== SEARCH & DISCOVERY ====================

@app.route('/api/search', methods=['GET'])
def search_breweries_endpoint():
    """Search breweries with enhanced Python backend API calls."""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'error': 'Query parameter required'}), 400
    
    try:
        # Use enhanced API service (Python requests)
        api_results = search_breweries(query, limit=20)
        
        # Get stored data from BigQuery
        stored_results = platform.search_stored_breweries(query)
        
        # Combine results
        results = {
            'api_results': api_results,
            'stored_results': stored_results,
            'total_api_results': len(api_results),
            'total_stored_results': len(stored_results),
            'search_method': 'enhanced_python_backend',
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search/fast', methods=['GET'])
def fast_search():
    """Fast brewery search using only Python backend API."""
    query = request.args.get('q', '').strip()
    print(f"🔍 Fast search request for query: '{query}'")
    
    if not query:
        return jsonify({'error': 'Query parameter required'}), 400
    
    try:
        # Use the enhanced API service with proper error handling
        print("🔧 Calling search_breweries...")
        results = search_breweries(query, limit=50)
        print(f"✅ Search complete. Found {len(results)} results")
        
        # Ensure we always return a list, even if empty
        if not isinstance(results, list):
            print("⚠️ Warning: search_breweries did not return a list")
            results = []
            
        return jsonify({
            'data': {
                'breweries': results,
                'count': len(results),
                'search_method': 'python_backend_only',
                'timestamp': datetime.now().isoformat()
            },
            'status': 'success'
        })
    except Exception as e:
        error_msg = f"Error in fast_search: {str(e)}"
        print(f"❌ {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': error_msg,
            'type': type(e).__name__,
            'status': 'error'
        }), 500

@app.route('/api/autocomplete', methods=['GET'])
def autocomplete():
    """Get autocomplete suggestions."""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])
    
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        suggestions = loop.run_until_complete(platform.get_autocomplete_suggestions(query))
        loop.close()
        
        return jsonify(suggestions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/random', methods=['GET'])
def random_brewery():
    """Get random brewery using enhanced Python backend."""
    try:
        # Use enhanced API service (Python requests)
        brewery = get_random_brewery()
        
        if brewery:
            return jsonify({
                'brewery': brewery,
                'source': 'enhanced_python_backend',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'No brewery found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/discovery', methods=['GET'])
def brewery_discovery():
    """Advanced brewery discovery engine."""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        discovery_data = loop.run_until_complete(platform.brewery_discovery_engine())
        loop.close()
        
        return jsonify(discovery_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== GEOGRAPHIC INTELLIGENCE ====================

@app.route('/api/geographic', methods=['GET'])
def geographic_search():
    """Geographic brewery search using Open Brewery DB API."""
    city = request.args.get('city', '')
    state = request.args.get('state', '')
    country = request.args.get('country', '')
    brewery_type = request.args.get('brewery_type', '')
    postal_code = request.args.get('postal_code', '')
    latitude = request.args.get('latitude', '')
    longitude = request.args.get('longitude', '')
    distance = request.args.get('distance', '')

    # Map frontend parameters to Open Brewery DB parameters
    params = {}
    if city:
        params['by_city'] = city
    if state:
        params['by_state'] = state
    if country:
        # Handle both 'US' and 'United States' as valid country parameters
        if country.lower() == 'united states' or country.upper() == 'US':
            params['by_country'] = 'United States'
        else:
            params['by_country'] = country
    if brewery_type:
        params['by_type'] = brewery_type
    if postal_code:
        params['by_postal'] = postal_code
    if latitude and longitude:
        params['by_dist'] = f"{latitude},{longitude}"
        if distance:
            params['per_page'] = 50  # Limit results for distance-based searches
    
    # Default to 50 results if not specified
    if 'per_page' not in params:
        params['per_page'] = 50
    
    # Handle distance-based search
    if request.args.get('latitude') and request.args.get('longitude'):
        try:
            lat = float(request.args.get('latitude'))
            lng = float(request.args.get('longitude'))
            distance = int(request.args.get('distance', 25))
            
            # Use the by_dist parameter for distance-based search
            params['by_dist'] = f"{lat},{lng}"
            
        except ValueError:
            return jsonify({'error': 'Invalid coordinates'}), 400
    
    # Make the API request to Open Brewery DB
    try:
        print(f"🔍 Making request to Open Brewery DB with params: {params}")
        response = requests.get('https://api.openbrewerydb.org/v1/breweries', params=params)
        response.raise_for_status()
        
        breweries = response.json()
        print(f"✅ Found {len(breweries)} breweries")
        
        # Add metadata to the response
        return jsonify({
            'breweries': breweries,
            'count': len(breweries),
            'params': params,
            'timestamp': datetime.now().isoformat()
        })
    except requests.exceptions.RequestException as e:
        error_message = f"Error fetching data from Open Brewery DB: {str(e)}"
        print(f"❌ {error_message}")
        return jsonify({'error': error_message}), 500
    except Exception as e:
        error_message = f"Unexpected error: {str(e)}"
        print(f"❌ {error_message}")
        return jsonify({'error': error_message}), 500
    
    return jsonify({'error': 'No search parameters provided'}), 400

# ==================== PIPELINE MANAGEMENT ====================

@app.route('/api/pipeline/status', methods=['GET'])
def pipeline_status():
    """Get pipeline status and metrics."""
    return jsonify({
        'status': 'active',
        'last_run': datetime.now().isoformat(),
        'next_scheduled': 'Manual trigger',
        'total_records': 8408,  # From our loaded data
        'korean_records': 61,
        'data_sources': ['Open Brewery DB API', 'BigQuery Storage'],
        'health': 'healthy'
    })

@app.route('/api/pipeline/run', methods=['POST'])
def run_pipeline():
    """Trigger pipeline run (placeholder for now)."""
    return jsonify({
        'message': 'Pipeline run initiated',
        'job_id': f'job_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        'status': 'running',
        'estimated_duration': '5-10 minutes'
    })

# ==================== LOOKER STUDIO INTEGRATION ====================

@app.route('/api/looker/config', methods=['GET'])
def looker_config():
    """Get Looker Studio dashboard configuration."""
    return jsonify({
        'dashboard_url': 'https://datastudio.google.com/embed/reporting/your-report-id',
        'public_url': 'https://datastudio.google.com/s/your-public-id',
        'embed_config': {
            'width': '100%',
            'height': '600px',
            'frameBorder': '0',
            'allowFullScreen': True
        },
        'available_reports': [
            {
                'name': 'Main Analytics Dashboard',
                'url': 'https://datastudio.google.com/embed/reporting/main-analytics',
                'description': 'Overview of brewery analytics and KPIs'
            },
            {
                'name': 'Geographic Analysis',
                'url': 'https://datastudio.google.com/embed/reporting/geographic',
                'description': 'Geographic distribution and regional insights'
            },
            {
                'name': 'Korean Market Analysis',
                'url': 'https://datastudio.google.com/embed/reporting/korean-market',
                'description': 'Detailed analysis of Korean brewery market'
            }
        ]
    })

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ==================== MAIN ====================

if __name__ == '__main__':
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Brewery Intelligence API Server')
    parser.add_argument('--port', type=int, default=5000, help='Port to run the server on')
    args = parser.parse_args()
    
    port = args.port
    
    print("🚀 BREWERY INTELLIGENCE API SERVER")
    print("=" * 50)
    print(f"🔗 API Endpoints:")
    print(f"   • Health: http://localhost:{port}/api/health")
    print(f"   • Analytics: http://localhost:{port}/api/analytics")
    print(f"   • Search: http://localhost:{port}/api/search?q=query")
    print(f"   • Geographic: http://localhost:{port}/api/geographic")
    print(f"   • Discovery: http://localhost:{port}/api/discovery")
    print(f"   • Pipeline: http://localhost:{port}/api/pipeline/status")
    print(f"\n🌐 Starting server on http://localhost:{port}")
    print("📊 Ready for React frontend connection!")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=True)

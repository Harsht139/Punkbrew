#!/usr/bin/env python3
"""
PRODUCTION SERVER - SINGLE PORT CONFIGURATION
=============================================
Serves both React frontend and Flask API on the same port (5000)

Architecture:
- http://localhost:5000/ → React App
- http://localhost:5000/api/* → Flask API
- All external API calls handled by Python backend (Option 2)
"""

import os
from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
from integrated_brewery_platform import IntegratedBreweryPlatform
from enhanced_api_service import api_service, search_breweries, get_random_brewery, search_by_location
from fast_analytics import fast_analytics
import json
from datetime import datetime

# Initialize Flask app
app = Flask(__name__, static_folder='frontend/build', static_url_path='')
CORS(app)

# Initialize brewery platform
try:
    platform = IntegratedBreweryPlatform()
    print("✅ BigQuery client initialized")
except Exception as e:
    print(f"⚠️  BigQuery initialization failed: {e}")
    platform = None

print("🚀 BREWERY INTELLIGENCE PRODUCTION SERVER")
print("=" * 50)
print("🌐 Single Port Configuration:")
print("   • Frontend: http://localhost:5000/")
print("   • API: http://localhost:5000/api/*")
print("   • Architecture: Option 2 (Python Backend)")
print("=" * 50)

# ==================== FRONTEND ROUTES ====================

@app.route('/')
def serve_react_app():
    """Serve the React app's main page."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_react_static(path):
    """Serve React static files or fallback to index.html for SPA routing."""
    file_path = os.path.join(app.static_folder, path)
    
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        # Fallback to index.html for React Router
        return send_from_directory(app.static_folder, 'index.html')

# ==================== API ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Enhanced health check endpoint."""
    api_health = api_service.health_check()
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'bigquery_connected': platform.bigquery_client is not None if platform else False,
        'external_api_health': api_health,
        'backend_type': 'enhanced_python_requests',
        'cache_stats': api_service.get_cache_stats(),
        'deployment': 'single_port_production'
    })

@app.route('/api/status', methods=['GET'])
def system_status():
    """System status endpoint."""
    return jsonify({
        'server': 'production',
        'port': 5000,
        'architecture': 'single_port',
        'frontend': 'react_build',
        'backend': 'flask_api',
        'option': 2,
        'timestamp': datetime.now().isoformat()
    })

# ==================== ANALYTICS & DASHBOARD ====================

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get brewery analytics data (SLOW - BigQuery)."""
    if not platform:
        return jsonify({'error': 'Platform not initialized'}), 500
    
    try:
        analytics = platform.get_brewery_analytics()
        return jsonify(analytics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/fast', methods=['GET'])
def get_fast_analytics():
    """Get fast analytics data (FAST - Cached API data)."""
    try:
        analytics = fast_analytics.get_quick_analytics()
        return jsonify(analytics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Get analytics summary (FAST)."""
    try:
        # Use fast analytics for summary
        summary = fast_analytics.get_summary_stats()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        stored_results = platform.search_stored_breweries(query) if platform else []
        
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
    if not query:
        return jsonify({'error': 'Query parameter required'}), 400
    
    try:
        # Only use enhanced API service (faster)
        results = search_breweries(query, limit=50)
        
        return jsonify({
            'breweries': results,
            'count': len(results),
            'search_method': 'python_backend_only',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/autocomplete', methods=['GET'])
def autocomplete():
    """Get autocomplete suggestions."""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])
    
    try:
        suggestions = api_service.get_autocomplete(query)
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
    """Get brewery discovery data."""
    try:
        # Get multiple random breweries for discovery
        discoveries = []
        for _ in range(5):
            brewery = get_random_brewery()
            if brewery:
                discoveries.append(brewery)
        
        return jsonify({
            'discoveries': discoveries,
            'count': len(discoveries),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== GEOGRAPHIC ====================

@app.route('/api/geographic', methods=['GET'])
def geographic_search():
    """Geographic brewery search."""
    try:
        filters = {}
        
        # Extract filters from query parameters
        for key in ['city', 'state', 'country', 'brewery_type', 'postal_code']:
            value = request.args.get(key, '').strip()
            if value:
                filters[key] = value
        
        if not filters:
            return jsonify({'error': 'At least one filter required'}), 400
        
        # Use enhanced API service for location search
        results = search_by_location(**filters)
        
        # Add geographic insights
        brewery_types = {}
        coordinates_count = 0
        websites_count = 0
        
        for brewery in results:
            # Count brewery types
            brewery_type = brewery.get('brewery_type', 'unknown')
            brewery_types[brewery_type] = brewery_types.get(brewery_type, 0) + 1
            
            # Count breweries with coordinates
            if brewery.get('latitude') and brewery.get('longitude'):
                coordinates_count += 1
                
            # Count breweries with websites
            if brewery.get('website_url'):
                websites_count += 1
        
        return jsonify({
            'breweries': results,
            'geographic_insights': {
                'found_breweries': len(results),
                'brewery_types_in_area': brewery_types,
                'has_coordinates': coordinates_count,
                'websites_available': websites_count
            },
            'global_context': [
                {'country': 'United States', 'count': 8346},
                {'country': 'South Korea', 'count': 61},
                {'country': 'Ireland', 'count': 1}
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== PIPELINE MANAGEMENT ====================

@app.route('/api/pipeline/status', methods=['GET'])
def pipeline_status():
    """Get pipeline status."""
    return jsonify({
        'status': 'active',
        'components': [
            {
                'name': 'Enhanced API Service',
                'status': 'active',
                'last_updated': datetime.now().isoformat(),
                'details': 'Python requests with caching'
            },
            {
                'name': 'Flask Backend',
                'status': 'active', 
                'last_updated': datetime.now().isoformat(),
                'details': 'Single port production server'
            },
            {
                'name': 'React Frontend',
                'status': 'active',
                'last_updated': datetime.now().isoformat(),
                'details': 'Built and served by Flask'
            },
            {
                'name': 'BigQuery Integration',
                'status': 'active' if platform and platform.bigquery_client else 'inactive',
                'last_updated': datetime.now().isoformat(),
                'details': 'Data warehouse connection'
            }
        ],
        'architecture': 'single_port_production',
        'timestamp': datetime.now().isoformat()
    })

# ==================== LOOKER DASHBOARD ====================

@app.route('/api/looker/config', methods=['GET'])
def looker_config():
    """Get Looker Studio dashboard configuration."""
    return jsonify({
        'dashboards': [
            {
                'name': 'Brewery Analytics Overview',
                'url': 'https://lookerstudio.google.com/embed/reporting/your-dashboard-id',
                'description': 'Main brewery intelligence dashboard'
            }
        ],
        'embedding_enabled': True,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🌐 Starting single-port production server...")
    print("📱 Frontend: http://localhost:5000/")
    print("🔧 API: http://localhost:5000/api/*")
    print("🎯 Architecture: Option 2 (Python Backend)")
    
    # Run the production server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,  # Production mode
        threaded=True
    )

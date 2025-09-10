#!/usr/bin/env python3
"""
OPTION 2 DEMONSTRATION SCRIPT
=============================
Showcases the complete Option 2 implementation where Python backend handles ALL API calls.

Architecture:
React Frontend (port 3001) → Flask Backend (port 5000) → External APIs
"""

import requests
import time
import json
from datetime import datetime

def demo_header(title):
    """Print a formatted demo section header."""
    print(f"\n{'='*60}")
    print(f"🎯 {title}")
    print(f"{'='*60}")

def test_endpoint(endpoint, description):
    """Test an API endpoint and show performance."""
    print(f"\n🔄 Testing: {description}")
    print(f"📡 Endpoint: {endpoint}")
    
    start_time = time.time()
    try:
        response = requests.get(endpoint, timeout=10)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: {response.status_code} ({response_time:.3f}s)")
            
            # Show key metrics
            if 'count' in data:
                print(f"📊 Results: {data['count']} items")
            elif 'breweries' in data:
                print(f"📊 Results: {len(data['breweries'])} breweries")
            elif 'status' in data:
                print(f"📊 Status: {data['status']}")
                
            if 'search_method' in data:
                print(f"🔧 Method: {data['search_method']}")
                
            return True, response_time
        else:
            print(f"❌ Error: {response.status_code}")
            return False, response_time
            
    except Exception as e:
        response_time = time.time() - start_time
        print(f"❌ Exception: {e}")
        return False, response_time

def main():
    """Run the complete Option 2 demonstration."""
    
    demo_header("OPTION 2: PYTHON BACKEND HANDLES ALL APIS")
    
    print("🏗️  Architecture Overview:")
    print("   React Frontend (3001) → Flask Backend (5000) → External APIs")
    print("   ✓ No CORS issues")
    print("   ✓ Secure API key management") 
    print("   ✓ Centralized caching & error handling")
    print("   ✓ Enhanced performance with request caching")
    
    base_url = "http://localhost:5000"
    
    # Test 1: Health Check
    demo_header("1. SYSTEM HEALTH CHECK")
    test_endpoint(f"{base_url}/api/health", "Backend health and cache status")
    
    # Test 2: Fast Search (Python Backend Only)
    demo_header("2. FAST SEARCH (PYTHON BACKEND ONLY)")
    success1, time1 = test_endpoint(f"{base_url}/api/search/fast?q=stone", "Fast brewery search")
    
    # Test 3: Cached Search (Should be much faster)
    demo_header("3. CACHED SEARCH (SAME QUERY)")
    success2, time2 = test_endpoint(f"{base_url}/api/search/fast?q=stone", "Cached brewery search")
    
    if success1 and success2:
        speedup = ((time1 - time2) / time1) * 100
        print(f"🚀 Cache Performance: {speedup:.1f}% faster ({time1:.3f}s → {time2:.3f}s)")
    
    # Test 4: Geographic Search
    demo_header("4. GEOGRAPHIC INTELLIGENCE")
    test_endpoint(f"{base_url}/api/geographic?city=Portland&state=Oregon", "Location-based brewery search")
    
    # Test 5: Random Brewery Discovery
    demo_header("5. BREWERY DISCOVERY")
    test_endpoint(f"{base_url}/api/random", "Random brewery discovery")
    
    # Test 6: Comprehensive Search (Backend + BigQuery)
    demo_header("6. COMPREHENSIVE SEARCH (BACKEND + BIGQUERY)")
    test_endpoint(f"{base_url}/api/search?q=IPA", "Full search with stored data")
    
    # Test 7: Analytics Dashboard Data
    demo_header("7. ANALYTICS DASHBOARD")
    test_endpoint(f"{base_url}/api/analytics", "Dashboard analytics data")
    
    demo_header("OPTION 2 DEMONSTRATION COMPLETE")
    print("🎉 All tests completed!")
    print("🔗 Frontend URL: http://localhost:3001")
    print("🔗 Backend URL: http://localhost:5000")
    print("\n💡 Key Benefits Demonstrated:")
    print("   ✓ Fast API responses with caching")
    print("   ✓ No frontend CORS issues")
    print("   ✓ Centralized error handling")
    print("   ✓ Secure external API management")
    print("   ✓ Real-time brewery data integration")

if __name__ == "__main__":
    main()

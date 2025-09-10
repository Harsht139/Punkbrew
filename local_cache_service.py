#!/usr/bin/env python3
"""
LOCAL CACHE SERVICE
==================
Store frequently accessed data locally for instant loading
"""

import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path

class LocalCacheService:
    """Local file-based cache for dashboard data."""
    
    def __init__(self, cache_dir="cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        # Cache TTL settings (in seconds)
        self.cache_ttl = {
            'analytics_summary': 3600,    # 1 hour
            'brewery_analytics': 1800,    # 30 minutes  
            'system_status': 300,         # 5 minutes
            'geographic_data': 7200       # 2 hours
        }
    
    def _get_cache_file(self, cache_key):
        """Get cache file path for a key."""
        return self.cache_dir / f"{cache_key}.json"
    
    def _is_cache_valid(self, cache_key):
        """Check if cached data is still valid."""
        cache_file = self._get_cache_file(cache_key)
        
        if not cache_file.exists():
            return False
        
        # Check file age
        file_age = time.time() - cache_file.stat().st_mtime
        ttl = self.cache_ttl.get(cache_key, 3600)  # Default 1 hour
        
        return file_age < ttl
    
    def get(self, cache_key):
        """Get data from cache if valid."""
        if not self._is_cache_valid(cache_key):
            return None
        
        try:
            cache_file = self._get_cache_file(cache_key)
            with open(cache_file, 'r') as f:
                data = json.load(f)
            
            print(f"📦 Cache HIT: {cache_key}")
            return data
        except Exception as e:
            print(f"❌ Cache read error: {e}")
            return None
    
    def set(self, cache_key, data):
        """Store data in cache."""
        try:
            cache_file = self._get_cache_file(cache_key)
            
            # Add metadata
            cache_data = {
                'data': data,
                'cached_at': datetime.now().isoformat(),
                'cache_key': cache_key,
                'ttl_seconds': self.cache_ttl.get(cache_key, 3600)
            }
            
            with open(cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)
            
            print(f"💾 Cache SET: {cache_key}")
            return True
        except Exception as e:
            print(f"❌ Cache write error: {e}")
            return False
    
    def invalidate(self, cache_key):
        """Remove specific cache entry."""
        try:
            cache_file = self._get_cache_file(cache_key)
            if cache_file.exists():
                cache_file.unlink()
                print(f"🗑️ Cache INVALIDATED: {cache_key}")
            return True
        except Exception as e:
            print(f"❌ Cache invalidation error: {e}")
            return False
    
    def clear_all(self):
        """Clear all cached data."""
        try:
            for cache_file in self.cache_dir.glob("*.json"):
                cache_file.unlink()
            print("🗑️ All cache cleared")
            return True
        except Exception as e:
            print(f"❌ Cache clear error: {e}")
            return False
    
    def get_cache_stats(self):
        """Get cache statistics."""
        stats = {
            'total_files': 0,
            'valid_files': 0,
            'expired_files': 0,
            'total_size_mb': 0,
            'cache_entries': []
        }
        
        try:
            for cache_file in self.cache_dir.glob("*.json"):
                stats['total_files'] += 1
                
                # File size
                size_bytes = cache_file.stat().st_size
                stats['total_size_mb'] += size_bytes / (1024 * 1024)
                
                # Check if valid
                cache_key = cache_file.stem
                is_valid = self._is_cache_valid(cache_key)
                
                if is_valid:
                    stats['valid_files'] += 1
                else:
                    stats['expired_files'] += 1
                
                # Entry info
                file_age = time.time() - cache_file.stat().st_mtime
                stats['cache_entries'].append({
                    'key': cache_key,
                    'valid': is_valid,
                    'age_minutes': round(file_age / 60, 1),
                    'size_kb': round(size_bytes / 1024, 1)
                })
        
        except Exception as e:
            print(f"❌ Cache stats error: {e}")
        
        stats['total_size_mb'] = round(stats['total_size_mb'], 2)
        return stats

# Global cache instance
local_cache = LocalCacheService()

# Pre-populate with static data for instant loading
def initialize_cache():
    """Initialize cache with static/fallback data."""
    
    # Fast analytics summary
    fast_summary = {
        'total_breweries_estimate': 8500,
        'countries_covered': 15,
        'brewery_types': 6,
        'last_updated': datetime.now().isoformat(),
        'data_source': 'local_cache_fallback',
        'load_time_ms': 5
    }
    
    # System status
    system_status = {
        'server': 'development',
        'backend': 'flask_api',
        'frontend': 'react_dev',
        'architecture': 'option_2',
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }
    
    # Store fallback data
    local_cache.set('analytics_summary', fast_summary)
    local_cache.set('system_status', system_status)
    
    print("🚀 Cache initialized with fallback data")

if __name__ == "__main__":
    # Test the cache service
    print("🧪 Testing Local Cache Service")
    print("=" * 40)
    
    # Initialize cache
    initialize_cache()
    
    # Test retrieval
    summary = local_cache.get('analytics_summary')
    print(f"📊 Summary: {summary['data']['total_breweries_estimate']} breweries")
    
    # Cache stats
    stats = local_cache.get_cache_stats()
    print(f"📈 Cache: {stats['valid_files']} valid, {stats['total_size_mb']} MB")

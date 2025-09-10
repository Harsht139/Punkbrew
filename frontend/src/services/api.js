// Standard development setup
const API_BASE_URL = 'http://localhost:5000';

// Fetch wrapper with error handling and logging
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log(`🔄 API Request: ${config.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, config);
    
    console.log(`✅ API Response: ${url} - ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error('❌ API Error:', error.message);
    throw error;
  }
};

// ==================== HEALTH & STATUS ====================

export const healthCheck = () => apiRequest('/api/health');
export const getSystemStatus = () => apiRequest('/api/status');

// ==================== ANALYTICS & DASHBOARD ====================

export const getAnalytics = () => apiRequest('/api/analytics');
export const getAnalyticsSummary = () => apiRequest('/api/analytics/summary');

// ==================== SEARCH & DISCOVERY ====================
// Search breweries (enhanced backend)
export const searchBreweries = async (query, fast = false) => {
  const endpoint = fast ? '/search/fast' : '/search';
  const response = await fetch(`${API_BASE_URL}${endpoint}?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  return response.json();
};

// Fast search (Python backend only)
export const fastSearchBreweries = async (query) => {
  return searchBreweries(query, true);
};

export const getAutocomplete = (query) => 
  apiRequest(`/api/autocomplete?q=${encodeURIComponent(query)}`);

export const getRandomBrewery = () => apiRequest('/api/random');
export const getBreweryDiscovery = () => apiRequest('/api/discovery');

// ==================== GEOGRAPHIC ====================

export const searchGeographic = (filters) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/api/geographic?${params}`);
};

export const searchByLocation = (city, state, country) => {
  const params = new URLSearchParams({ city, state, country }).toString();
  return apiRequest(`/api/geographic?${params}`);
};

export const searchByDistance = (latitude, longitude, distance = 25) => {
  const params = new URLSearchParams({ latitude, longitude, distance }).toString();
  return apiRequest(`/api/geographic?${params}`);
};

// ==================== PIPELINE ====================

export const getPipelineStatus = () => apiRequest('/api/pipeline/status');
export const runPipeline = () => apiRequest('/api/pipeline/run', { method: 'POST' });

// ==================== LOOKER STUDIO ====================

export const getLookerConfig = () => apiRequest('/api/looker/config');

// ==================== ERROR HANDLING UTILITIES ====================

export const handleApiError = (error) => {
  if (error.message.includes('HTTP error')) {
    // Server responded with error status
    const status = error.message.match(/status: (\d+)/)?.[1];
    return {
      message: `Server error: ${status || 'Unknown'}`,
      status: parseInt(status) || 500,
      type: 'server_error'
    };
  } else if (error.message.includes('Failed to fetch')) {
    // Network error - request was made but no response received
    return {
      message: 'Unable to connect to server. Please check your connection.',
      type: 'network_error'
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      type: 'unknown_error'
    };
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const formatBreweryData = (brewery) => {
  return {
    id: brewery.id,
    name: brewery.name || 'Unknown Brewery',
    type: brewery.brewery_type || brewery.type || 'Unknown',
    city: brewery.city || 'Unknown City',
    state: brewery.state || '',
    country: brewery.country || 'Unknown Country',
    website: brewery.website_url,
    phone: brewery.phone,
    address: brewery.address_1,
    coordinates: brewery.latitude && brewery.longitude ? {
      lat: parseFloat(brewery.latitude),
      lng: parseFloat(brewery.longitude)
    } : null
  };
};

export const formatAnalyticsData = (analytics) => {
  return {
    totalBreweries: analytics.total_breweries || 0,
    countries: analytics.countries || 0,
    koreanBreweries: analytics.korean_breweries || 0,
    topBreweryType: analytics.top_brewery_type || 'Unknown',
    lastUpdated: analytics.last_updated || new Date().toISOString(),
    charts: {
      geographic: analytics.analytics?.geographic_distribution || [],
      breweryTypes: analytics.analytics?.brewery_types || [],
      koreanMarket: analytics.analytics?.korean_breweries || []
    }
  };
};

// All API functions exported above

// ============================================
// CONFIGURATION
// ============================================

export const APP_CONFIG = {
  name: 'World Events Monitor',
  version: '1.0.0',
  defaultCenter: [20, 20],
  defaultZoom: 2,
  maxZoom: 18,
  minZoom: 1,
  tileServer: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  
  // Event type definitions with colors and icons
  eventTypes: {
    conflicts: {
      color: '#ff6b6b',
      icon: 'conflict',
      label: 'Conflict Zones',
      severity: ['low', 'medium', 'high', 'critical']
    },
    disease: {
      color: '#ff9ff3',
      icon: 'disease',
      label: 'Disease Outbreaks',
      severity: ['low', 'medium', 'high', 'pandemic']
    },
    wildfire: {
      color: '#ff6b6b',
      icon: 'wildfire',
      label: 'Wildfires',
      severity: ['minor', 'moderate', 'major', 'extreme']
    },
    natural: {
      color: '#48dbfb',
      icon: 'earthquake',
      label: 'Earthquakes',
      severity: ['minor', 'light', 'moderate', 'strong', 'major']
    },
    climate: {
      color: '#54a0ff',
      icon: 'storm',
      label: 'Weather Events',
      severity: ['low', 'medium', 'high']
    }
  },

  // Time range settings
  timeRanges: {
    '24h': { hours: 24, label: '24 hours' },
    '7d': { hours: 168, label: '7 days' },
    '30d': { hours: 720, label: '30 days' },
    'all': { hours: 8760, label: '1 year' } // Limit "all" to 1 year as requested
  },

  // Animation settings
  animation: {
    fps: 30,
    duration: 60, // seconds to play through full range
  },

  // Update settings
  updates: {
    pollInterval: 600000, // 10 minutes
    sseRetryDelay: 5000,
  },

  // Search settings
  search: {
    debounce: 300,
    minChars: 2,
    limit: 10,
  },

  // Cluster settings
  clustering: {
    radius: 50,
    maxZoom: 14,
  }
};

// Layer presets
export const LAYER_PRESETS = {
  security: ['conflicts', 'disease'],
  natural: ['natural', 'wildfire', 'climate'],
  all: Object.keys(APP_CONFIG.eventTypes),
  default: ['conflicts', 'disease', 'wildfire', 'natural', 'climate']
};

// API endpoints (mock/real)
export const API_ENDPOINTS = {
  // Real data sources
  usgs: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson', // Magnitude 1.0+ provides a high density of events without extreme clutter
  valyu: '/valyu-api/v1/search',
  eonet: 'https://eonet.gsfc.nasa.gov/api/v3/events?days=30',
  gdacs: 'https://www.gdacs.org/xml/rss.xml',
  
  // Geocoding
  nominatim: 'https://nominatim.openstreetmap.org/search',
  
  // Weather
  tomorrow: 'https://api.tomorrow.io/v4/weather/realtime',
  
  // For mock/SSE
  events: '/api/events',
  sse: '/api/events/stream',
};

// SVG Icons map
export const ICONS = {
  conflict: '<path d="M8 1L2 7v2l6-6 6 6V7L8 1zM4 9v6h2v-4h4v4h2V9L8 4 4 9z"/>',
  military: '<path d="M8 0c-2 3-4 5-4 8a4 4 0 008 0c0-2-1.5-4-2-6-.5 1.5-1 3-2 3V0z"/>',
  wildfire: '<path d="M8 0c-2 3-4 5-4 8a4 4 0 008 0c0-2-1.5-4-2-6-.5 1.5-1 3-2 3V0z"/>',
  earthquake: '<path d="M8 1L1 15h14L8 1z"/>',
  storm: '<path d="M8 2a5 5 0 00-5 5v1H2v2h14V8h-1V7a5 5 0 00-5-5z"/>',
  climate: '<path d="M8 0a4 4 0 00-4 4v4a4 4 0 008 0V4a4 4 0 00-4-4z"/>',
  disease: '<path d="M8 0a3 3 0 00-3 3v1H4v2h1v6h2V6h2v6h2V6h1V4h-1V3a3 3 0 00-3-3z"/>',
  sanctions: '<path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14A6 6 0 118 2a6 6 0 010 12z"/><path d="M4 8h8v2H4z"/>',
  location: '<path d="M8 0a5 5 0 00-5 5c0 5 5 11 5 11s5-6 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"/>',
  clock: '<path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14A6 6 0 118 2a6 6 0 010 12z"/><path d="M7 4h2v5H7z"/><path d="M8 9l3 2-1 1-2-1V9z"/>',
};

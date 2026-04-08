// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format a timestamp relative to now
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

/**
 * Format a date for display
 */
export function formatDate(date, options = {}) {
  const d = new Date(date);
  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return d.toLocaleString(undefined, { ...defaultOptions, ...options });
}

/**
 * Debounce function calls
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone an object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get distance between two lat/lng points in km
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Create an SVG element from a path string
 */
export function createSvg(path, size = 16) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'currentColor');
  svg.innerHTML = path;
  return svg;
}

/**
 * Parse query parameters from URL
 */
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    lat: parseFloat(params.get('lat')) || null,
    lng: parseFloat(params.get('lng')) || null,
    zoom: parseInt(params.get('zoom')) || null,
    layers: params.get('layers')?.split(',') || null,
    time: params.get('time') || null,
  };
}

/**
 * Update URL with current state
 */
export function updateUrlParams(params) {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.replaceState({}, '', url);
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/**
 * Interpolate between two values
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert severity level to color
 */
export function getSeverityColor(severity) {
  const colors = {
    critical: '#da3633',
    high: '#d29922',
    major: '#d29922',
    pandemic: '#da3633',
    medium: '#d29922',
    moderate: '#d29922',
    strong: '#d29922',
    warning: '#d29922',
    alert: '#da3633',
    low: '#238636',
    minor: '#238636',
    light: '#238636',
    watch: '#d29922',
    targeted: '#d29922',
    sectoral: '#d29922',
    comprehensive: '#da3633',
  };
  return colors[severity?.toLowerCase()] || '#6e7681';
}

/**
 * Parse RSS/GeoJSON data
 */
export async function parseFeed(url, type = 'json') {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  if (type === 'json') {
    return await response.json();
  }
  return await response.text();
}

/**
 * Local storage wrapper with JSON support
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

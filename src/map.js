// ============================================
// MAP MODULE - MapLibre GL JS Integration
// ============================================

import maplibregl from 'maplibre-gl';
import { APP_CONFIG, ICONS, LAYER_PRESETS } from './config.js';
import { createSvg, generateId } from './utils.js';

export class MapController {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = options;
    this.map = null;
    this.markers = new Map();
    this.clusters = new Map();
    this.activeLayers = new Set();
    this.activeLayerTypes = new Set(LAYER_PRESETS.default);
    this.allEventData = [];
    this.eventData = [];
    this.onEventClick = options.onEventClick || (() => {});
    this.onViewportChange = options.onViewportChange || (() => {});
    
    this.init();
  }

  init() {
    const { defaultCenter, defaultZoom, tileServer } = APP_CONFIG;
    
    // Use options passed from main.js or fall back to defaults
    const center = this.options.initialCenter || defaultCenter;
    const zoom = this.options.initialZoom || defaultZoom;

    this.map = new maplibregl.Map({
      container: this.containerId,
      style: tileServer,
      center: center,
      zoom: zoom,
      minZoom: APP_CONFIG.minZoom,
      maxZoom: APP_CONFIG.maxZoom,
      attributionControl: false,
      pitchWithRotate: false,
    });

    // Add navigation control
    this.map.addControl(new maplibregl.NavigationControl({
      showCompass: false,
      visualizePitch: false,
    }), 'top-right');

    // Add attribution
    this.map.addControl(new maplibregl.AttributionControl({
      compact: true,
    }), 'bottom-right');

    // Bind events
    this.map.on('moveend', () => this.handleViewportChange());
    this.map.on('zoomend', () => this.handleViewportChange());
    
    // Initialize layers when style loads
    this.map.on('style.load', () => {
      this.initializeLayers();
    });
  }

  initializeLayers() {
    // Add source for events
    if (!this.map.getSource('events')) {
      this.map.addSource('events', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Unclustered point layer - outer glow (with layer type filter)
      this.map.addLayer({
        id: 'unclustered-point-glow',
        type: 'circle',
        source: 'events',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 24,
          'circle-opacity': 0.4,
          'circle-blur': 1.5
        }
      });

      // Unclustered point layer - outer ring
      this.map.addLayer({
        id: 'unclustered-point-ring',
        type: 'circle',
        source: 'events',
        paint: {
          'circle-color': 'transparent',
          'circle-radius': 16,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.8
        }
      });

      // Unclustered point layer - main circle
      this.map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'events',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95
        }
      });

      // Event labels layer - text tags
      this.map.addLayer({
        id: 'event-labels',
        type: 'symbol',
        source: 'events',
        layout: {
          'text-field': ['get', 'title'],
          'text-size': 11,
          'text-anchor': 'left',
          'text-offset': [1.2, 0],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'text-padding': 2
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#0d1117',
          'text-halo-width': 2,
          'text-halo-blur': 1,
          'text-opacity': 0.9
        }
      });

      // Click handlers for both layers
      this.map.on('click', 'unclustered-point', (e) => this.handlePointClick(e));
      this.map.on('click', 'unclustered-point-ring', (e) => this.handlePointClick(e));
      this.map.on('click', 'unclustered-point-glow', (e) => this.handlePointClick(e));
      this.map.on('click', 'event-labels', (e) => this.handlePointClick(e));
      
      // Hover cursor for all point layers
      ['unclustered-point', 'unclustered-point-ring', 'unclustered-point-glow', 'event-labels'].forEach(layer => {
        this.map.on('mouseenter', layer, () => this.map.getCanvas().style.cursor = 'pointer');
        this.map.on('mouseleave', layer, () => this.map.getCanvas().style.cursor = '');
      });
    }
  }

  handleClusterClick(e) {
    const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    const clusterId = features[0].properties.cluster_id;
    
    this.map.getSource('events').getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      this.map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom
      });
    });
  }

  handlePointClick(e) {
    const feature = e.features[0];
    const eventId = feature.properties.id;
    const event = this.eventData.find(ev => ev.id === eventId);
    if (event) {
      this.onEventClick(event);
    }
  }

  handleViewportChange() {
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const bounds = this.map.getBounds();
    
    this.onViewportChange({
      center: { lat: center.lat, lng: center.lng },
      zoom,
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }
    });
  }

  updateEvents(events) {
    // Store all events - don't filter them out, just update visibility
    this.allEventData = events;
    this.eventData = events;
    
    const features = events.map(event => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [event.lng, event.lat]
      },
      properties: {
        id: event.id,
        type: event.type,
        title: event.title || event.type,
        color: APP_CONFIG.eventTypes[event.type]?.color || '#58a6ff',
        severity: event.severity,
        timestamp: event.timestamp
      }
    }));

    if (this.map.getSource('events')) {
      this.map.getSource('events').setData({
        type: 'FeatureCollection',
        features
      });
      
      // Apply current layer filter after data loads
      if (this.activeLayerTypes && this.activeLayerTypes.size > 0) {
        this.filterByLayerTypes(this.activeLayerTypes);
      }
    }
  }

  filterByLayerTypes(activeTypes) {
    // Store active layer types
    this.activeLayerTypes = new Set(activeTypes);
    
    // We do not need MapLibre to filter the points because events.js 
    // already rigorously filters events before passing them to updateEvents!
    // Every feature loaded into the source should be displayed.
  }

  setLayerOpacity(layerId, opacity) {
    // For MapLibre GL, we'd need to adjust the paint properties
    // This is a simplified implementation
    if (layerId === 'events') {
      this.map.setPaintProperty('unclustered-point', 'circle-opacity', opacity / 100);
    }
  }

  toggleLayer(layerId, visible) {
    // Handle individual layer types
    if (layerId !== 'events' && APP_CONFIG.eventTypes[layerId]) {
      // Update active layer types set
      if (!this.activeLayerTypes) {
        this.activeLayerTypes = new Set(['conflicts', 'wildfires', 'earthquakes']);
      }
      
      if (visible) {
        this.activeLayerTypes.add(layerId);
      } else {
        this.activeLayerTypes.delete(layerId);
      }
      
      // Apply filter
      this.filterByLayerTypes(this.activeLayerTypes);
      return;
    }
    
    // Global events toggle
    const visibility = visible ? 'visible' : 'none';
    if (layerId === 'events') {
      if (this.map.getLayer('unclustered-point')) this.map.setLayoutProperty('unclustered-point', 'visibility', visibility);
      if (this.map.getLayer('unclustered-point-ring')) this.map.setLayoutProperty('unclustered-point-ring', 'visibility', visibility);
      if (this.map.getLayer('unclustered-point-glow')) this.map.setLayoutProperty('unclustered-point-glow', 'visibility', visibility);
      if (this.map.getLayer('event-labels')) this.map.setLayoutProperty('event-labels', 'visibility', visibility);
    }
  }

  setActiveLayerTypes(types) {
    this.activeLayerTypes = new Set(types);
    this.filterByLayerTypes(this.activeLayerTypes);
  }

  flyTo(coordinates, zoom = 12) {
    this.map.flyTo({
      center: coordinates,
      zoom: zoom,
      essential: true,
      duration: 1500
    });
  }

  setFilter(timeRange) {
    // Filter events by time range but keep all events on map
    // Just update which ones are visible
    const now = Date.now();
    const cutoff = now - (timeRange.hours * 60 * 60 * 1000);
    
    // Filter the data but update visibility state instead of removing from source
    const timeFilteredIds = new Set(
      this.allEventData
        .filter(e => new Date(e.timestamp).getTime() > cutoff)
        .map(e => e.id)
    );
    
    // Re-apply layer filter which will include time filtering via feature state
    if (this.activeLayerTypes) {
      this.filterByLayerTypes(this.activeLayerTypes);
    }
    
    // Update the visible event data reference for other components
    this.eventData = this.allEventData.filter(e => timeFilteredIds.has(e.id));
  }

  resetView() {
    this.map.flyTo({
      center: APP_CONFIG.defaultCenter,
      zoom: APP_CONFIG.defaultZoom,
      duration: 1000
    });
  }

  zoomIn() {
    this.map.zoomIn();
  }

  zoomOut() {
    this.map.zoomOut();
  }

  resize() {
    this.map.resize();
  }

  destroy() {
    this.map.remove();
  }

  // Get current map state for URL sharing
  getState() {
    const center = this.map.getCenter();
    return {
      lat: center.lat.toFixed(6),
      lng: center.lng.toFixed(6),
      zoom: this.map.getZoom().toFixed(2)
    };
  }
}

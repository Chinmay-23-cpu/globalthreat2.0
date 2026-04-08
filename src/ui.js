// ============================================
// UI MODULE - User Interface Controllers
// ============================================

import { APP_CONFIG, LAYER_PRESETS } from './config.js';
import { formatRelativeTime, formatDate, sanitizeHtml, debounce, storage, updateUrlParams, getSeverityColor } from './utils.js';
import { ICONS } from './config.js';

export class UIController {
  constructor(eventsManager, mapController) {
    this.events = eventsManager;
    this.map = mapController;
    this.isPlaying = false;
    this.animationFrame = null;
    this.notificationCount = 0;
    
    this.init();
  }

  init() {
    this.bindLayerControls();
    this.bindTimeControls();
    this.bindSearch();
    this.bindDetailOverlay();
    this.bindNotifications();
    this.bindHeaderControls();
    this.bindKeyboardShortcuts();
    this.bindMobileControls();
    
    // Initialize from storage
    this.loadPreferences();
  }

  bindLayerControls() {
    // Legend Checkboxes
    document.querySelectorAll('.legend-item__checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const activeLayers = Array.from(document.querySelectorAll('.legend-item__checkbox:checked'))
                                  .map(cb => cb.dataset.layer);
        
        this.events.setLayers(activeLayers);
        this.map.setActiveLayerTypes(activeLayers);
        this.updateUrlState();
      });
    });

    // Pill-based Layer toggles (keeping for compatibility if any remain)
    document.querySelectorAll('.layer-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const btn = e.target;
        btn.classList.toggle('active');
        
        const activeLayers = Array.from(document.querySelectorAll('.layer-toggle.active'))
                                  .map(t => t.dataset.layer);
        
        this.events.setLayers(activeLayers);
        this.map.setActiveLayerTypes(activeLayers);
        this.updateUrlState();
      });
    });
  }

  bindTimeControls() {
    // Pill-based Quick range buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const range = e.target.dataset.range;
        
        // Update active state
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('time-btn--active'));
        e.target.classList.add('time-btn--active');
        
        // Set time range
        this.events.setTimeRange(range);
        this.updateUrlState();
      });
    });
  }

  bindSearch() {
    const searchInput = document.getElementById('global-search');
    const resultsContainer = document.getElementById('search-results');

    if (!searchInput || !resultsContainer) return;

    const performSearch = debounce(async (query) => {
      if (query.length < APP_CONFIG.search.minChars) {
        resultsContainer.classList.remove('search-results--visible');
        return;
      }

      // Simulated search results
      const results = this.simulateSearchResults(query);
      this.renderSearchResults(results, resultsContainer);
      resultsContainer.classList.add('search-results--visible');
    }, APP_CONFIG.search.debounce);

    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value.trim());
    });

    searchInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          console.log(`🔍 Zooming map to: ${query}`);
          resultsContainer.classList.remove('search-results--visible');
          
          // Use precise geocoding via Gemini
          const coords = await this.events.getLocationCoordinates(query);
          if (coords) {
            console.log(`📍 Precise Geocoding:`, coords);
            this.map.flyTo([coords.lng, coords.lat], 10);
          } else {
            // Fallback: Check local results
            const matched = this.simulateSearchResults(query)[0];
            if (matched) {
              this.map.flyTo([matched.lng, matched.lat], 6);
            }
          }
        }
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length >= APP_CONFIG.search.minChars) {
        resultsContainer.classList.add('search-results--visible');
      }
    });

    // Close search on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header__search')) {
        resultsContainer.classList.remove('search-results--visible');
      }
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (searchInput && e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  simulateSearchResults(query) {
    const locations = [
      { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
      { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
      { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
      { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
      { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
      { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
    ];

    return locations
      .filter(loc => loc.name.toLowerCase().includes(query.toLowerCase()))
      .map(loc => ({
        type: 'location',
        title: loc.name,
        subtitle: loc.country,
        lat: loc.lat,
        lng: loc.lng
      }));
  }

  renderSearchResults(results, container) {
    if (results.length === 0) {
      container.innerHTML = '<div class="search-result"><span class="search-result__title">No results found</span></div>';
      return;
    }

    container.innerHTML = results.map((result, index) => `
      <div class="search-result" data-index="${index}" data-lat="${result.lat}" data-lng="${result.lng}">
        <div class="search-result__icon">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 0a5 5 0 00-5 5c0 5 5 11 5 11s5-6 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </div>
        <div class="search-result__info">
          <span class="search-result__title">${sanitizeHtml(result.title)}</span>
          <span class="search-result__subtitle">${sanitizeHtml(result.subtitle)}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', () => {
        const lat = parseFloat(el.dataset.lat);
        const lng = parseFloat(el.dataset.lng);
        this.map.flyTo([lng, lat], 10);
        container.classList.remove('search-results--visible');
        document.getElementById('global-search').value = '';
      });
    });
  }

  bindDetailOverlay() {
    const overlay = document.getElementById('detail-overlay');
    const closeBtn = document.getElementById('detail-close');
    const backdrop = overlay.querySelector('.detail-drawer__backdrop');

    const closeOverlay = () => {
      overlay.classList.remove('detail-drawer--visible');
      overlay.setAttribute('aria-hidden', 'true');
    };

    closeBtn.addEventListener('click', closeOverlay);
    backdrop.addEventListener('click', closeOverlay);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('detail-drawer--visible')) {
        closeOverlay();
      }
    });
  }

  bindNotifications() {
    const toggle = document.getElementById('notifications-toggle');
    const panel = document.getElementById('notification-panel');
    const closeBtn = document.getElementById('notification-close');
    const badge = document.getElementById('notification-badge');

    if (!toggle || !panel || !closeBtn || !badge) return;

    toggle.addEventListener('click', () => {
      const isVisible = panel.classList.contains('notification-panel--visible');
      panel.classList.toggle('notification-panel--visible', !isVisible);
      panel.setAttribute('aria-hidden', isVisible ? 'true' : 'false');
      
      if (!isVisible) {
        // Clear badge when opened
        this.notificationCount = 0;
        badge.hidden = true;
        badge.textContent = '0';
      }
    });

    closeBtn.addEventListener('click', () => {
      panel.classList.remove('notification-panel--visible');
      panel.setAttribute('aria-hidden', 'true');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#notification-panel') && !e.target.closest('#notifications-toggle')) {
        panel.classList.remove('notification-panel--visible');
        panel.setAttribute('aria-hidden', 'true');
      }
    });
  }

  bindHeaderControls() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Sidebar collapse toggle (handle)
    const toggleHandle = document.getElementById('sidebar-toggle-handle');
    const feedPanel = document.getElementById('event-panel');
    if (toggleHandle && feedPanel) {
      toggleHandle.addEventListener('click', () => {
        feedPanel.classList.toggle('feed-panel--collapsed');
        toggleHandle.classList.toggle('sidebar-toggle-handle--active');
        
        const isCollapsed = feedPanel.classList.contains('feed-panel--collapsed');
        toggleHandle.setAttribute('aria-expanded', !isCollapsed);
        
        // Trigger map resize since sidebar changed
        setTimeout(() => this.map.resize(), 400);
      });
    }

    // Secondary collapse btn inside panel
    const collapseBtn = document.getElementById('feed-collapse-btn');
    if (collapseBtn && feedPanel) {
      collapseBtn.addEventListener('click', () => {
        feedPanel.classList.add('feed-panel--collapsed');
        toggleHandle.classList.add('sidebar-toggle-handle--active');
        setTimeout(() => this.map.resize(), 400);
      });
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        const leftPanel = document.getElementById('layer-panel');
        if (leftPanel) {
          leftPanel.classList.toggle('panel--left--open');
          menuToggle.setAttribute('aria-expanded', 
            leftPanel.classList.contains('panel--left--open'));
        } else {
          // Fallback if layer-panel is missing but we want to toggle something
          const layerToggles = document.getElementById('layerToggles');
          if (layerToggles) {
            layerToggles.classList.toggle('layer-toggles--visible');
          }
        }
      });
    }

    // Alert ticker close
    document.querySelector('.alert-ticker__close').addEventListener('click', () => {
      document.getElementById('alert-ticker').classList.remove('alert-ticker--visible');
    });
  }

  bindMobileControls() {
    // Map zoom controls
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const resetView = document.getElementById('reset-view');
    
    if (zoomIn) zoomIn.addEventListener('click', () => this.map.zoomIn());
    if (zoomOut) zoomOut.addEventListener('click', () => this.map.zoomOut());
    if (resetView) resetView.addEventListener('click', () => this.map.resetView());

    // Event filter button (mobile) - Add null check since it might be removed
    const eventFilterBtn = document.getElementById('event-filter-btn');
    if (eventFilterBtn) {
      eventFilterBtn.addEventListener('click', () => {
        const rightPanel = document.getElementById('event-panel');
        if (rightPanel) rightPanel.classList.toggle('panel--right--open');
      });
    }

    // Close panels on mobile when clicking outside
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) {
        const leftPanel = document.getElementById('layer-panel');
        const rightPanel = document.getElementById('event-panel');
        
        if (leftPanel && !e.target.closest('#layer-panel') && !e.target.closest('#menu-toggle')) {
          leftPanel.classList.remove('panel--left--open');
        }
        
        if (rightPanel && !e.target.closest('#event-panel') && !e.target.closest('#event-filter-btn')) {
          rightPanel.classList.remove('panel--right--open');
        }
      }
    });
  }

  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      
      switch(e.key.toLowerCase()) {
        case 'l':
          e.preventDefault();
          const leftPanel = document.getElementById('layer-panel');
          if (leftPanel) {
            leftPanel.classList.toggle('panel--left--open');
          }
          break;
        case 't':
          e.preventDefault();
          this.toggleTimeAnimation();
          break;
        case 'r':
          e.preventDefault();
          this.map.resetView();
          break;
        case 'escape':
          // Close all panels
          document.querySelectorAll('.panel--left, .panel--right').forEach(p => {
            p.classList.remove('panel--left--open', 'panel--right--open');
          });
          document.getElementById('detail-overlay').classList.remove('detail-drawer--visible');
          document.getElementById('notification-panel').classList.remove('notification-panel--visible');
          break;
      }
    });
  }

  toggleTimeAnimation() {
    this.isPlaying = !this.isPlaying;
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    
    playIcon.hidden = this.isPlaying;
    pauseIcon.hidden = !this.isPlaying;
    
    if (this.isPlaying) {
      this.startTimeAnimation();
    } else {
      this.stopTimeAnimation();
    }
  }

  startTimeAnimation() {
    const slider = document.getElementById('time-range');
    let value = parseInt(slider.value);
    
    const animate = () => {
      if (!this.isPlaying) return;
      
      value -= 0.5;
      if (value < 0) value = 100;
      
      slider.value = value;
      this.updateTimeDisplay(value);
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  stopTimeAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  updateTimeSlider(range) {
    // Update slider based on selected range
    const timeDisplay = document.getElementById('time-display');
    timeDisplay.textContent = APP_CONFIG.timeRanges[range]?.label || 'Custom';
  }

  updateTimeDisplay(value) {
    const timeDisplay = document.getElementById('time-display');
    const hours = Math.floor((value / 100) * this.timeRange?.hours || 24);
    timeDisplay.textContent = `-${this.timeRange?.hours - hours}h`;
  }

  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    storage.set('theme', newTheme);
    
    // Update icons
    const moonIcon = document.getElementById('theme-icon-moon');
    const sunIcon = document.getElementById('theme-icon-sun');
    if (moonIcon) moonIcon.hidden = !isDark;
    if (sunIcon) sunIcon.hidden = isDark;
  }

  loadPreferences() {
    const theme = storage.get('theme', 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    
    const moonIcon = document.getElementById('theme-icon-moon');
    const sunIcon = document.getElementById('theme-icon-sun');
    if (moonIcon) moonIcon.hidden = theme === 'light';
    if (sunIcon) sunIcon.hidden = theme !== 'light';
  }

  updateUrlState() {
    const mapState = this.map.getState();
    updateUrlParams({
      lat: mapState.lat,
      lng: mapState.lng,
      zoom: mapState.zoom,
      layers: [...this.events.activeLayers].join(','),
      time: Object.keys(APP_CONFIG.timeRanges).find(
        k => APP_CONFIG.timeRanges[k] === this.events.timeRange
      )
    });
  }

  // Event list rendering
  renderEventList(events) {
    const container = document.getElementById('event-list');
    const countEl = document.getElementById('event-count');
    
    countEl.textContent = events.length;
    
    if (events.length === 0) {
      container.innerHTML = `
        <div class="event-list__empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="24" cy="24" r="20"/>
            <path d="M24 14v10l6 6"/>
          </svg>
          <p>No events match current filters</p>
        </div>
      `;
      return;
    }

    container.innerHTML = events.map(event => this.createEventCard(event)).join('');
    
    // Add click handlers
    container.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        const eventId = card.dataset.eventId;
        const event = this.events.getEventById(eventId);
        if (event) {
          this.showEventDetail(event);
          this.map.flyTo([event.lng, event.lat], 12);
        }
      });
    });
  }

  createEventCard(event) {
    const typeConfig = APP_CONFIG.eventTypes[event.type];
    const severityColor = getSeverityColor(event.severity);
    
    return `
      <article class="event-card" data-event-id="${event.id}" tabindex="0" role="article">
        <div class="event-card__icon" style="--event-color: ${typeConfig?.color || '#58a6ff'}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            ${ICONS[typeConfig?.icon] || ICONS.location}
          </svg>
        </div>
        <div class="event-card__content">
          <div class="event-card__header">
            <h3 class="event-card__title">${sanitizeHtml(event.title)}</h3>
            <span class="event-card__severity" style="--severity-color: ${severityColor}">${event.severity}</span>
          </div>
          <div class="event-card__location">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              ${ICONS.location}
            </svg>
            ${sanitizeHtml(event.location)}
          </div>
          <div class="event-card__meta">
            <span class="event-card__time">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                ${ICONS.clock}
              </svg>
              ${formatRelativeTime(event.timestamp)}
            </span>
            <span>Source: ${sanitizeHtml(event.source)}</span>
          </div>
        </div>
      </article>
    `;
  }

  showEventDetail(event) {
    const overlay = document.getElementById('detail-overlay');
    const content = document.getElementById('detail-content');
    const typeConfig = APP_CONFIG.eventTypes[event.type];
    const severityColor = getSeverityColor(event.severity);
    
    content.innerHTML = `
      <div class="event-detail">
        <div class="event-detail__header">
          <div class="event-detail__icon" style="--event-color: ${typeConfig?.color || '#58a6ff'}">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="currentColor">
              ${ICONS[typeConfig?.icon] || ICONS.location}
            </svg>
          </div>
          <div class="event-detail__title-wrap">
            <h2 id="detail-title" class="event-detail__title">${sanitizeHtml(event.title)}</h2>
            <div class="event-detail__meta">
              <span style="color: ${severityColor}">${event.severity.toUpperCase()}</span>
              <span>${sanitizeHtml(event.location)}</span>
              <span>${formatDate(event.timestamp)}</span>
            </div>
          </div>
        </div>
        
        <div class="event-detail__section">
          <h3 class="event-detail__section-title">Description</h3>
          <p class="event-detail__description">${sanitizeHtml(event.description)}</p>
        </div>
        
        <div class="event-detail__section">
          <h3 class="event-detail__section-title">Details</h3>
          <div class="event-detail__stats">
            <div class="stat-item">
              <div class="stat-item__label">Confidence</div>
              <div class="stat-item__value">${event.confidence}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-item__label">Type</div>
              <div class="stat-item__value">${typeConfig?.label || event.type}</div>
            </div>
            ${event.affectedArea ? `
              <div class="stat-item">
                <div class="stat-item__label">Affected Area</div>
                <div class="stat-item__value">${event.affectedArea} km²</div>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="event-detail__actions">
          <a href="${event.url}" target="_blank" rel="noopener" class="btn btn--primary">View Source</a>
          <button class="btn btn--secondary" onclick="this.closest('.detail-drawer').classList.remove('detail-drawer--visible')">Close</button>
        </div>
      </div>
    `;
    
    overlay.classList.add('detail-drawer--visible');
    overlay.setAttribute('aria-hidden', 'false');
  }

  showNotification(event) {
    this.notificationCount++;
    const badge = document.getElementById('notification-badge');
    badge.textContent = this.notificationCount;
    badge.hidden = false;
    
    // Add to notification list
    const list = document.getElementById('notification-list');
    const item = document.createElement('div');
    item.className = 'notification-item notification-item--unread';
    item.innerHTML = `
      <div class="notification-item__icon">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          ${ICONS[APP_CONFIG.eventTypes[event.type]?.icon] || ICONS.location}
        </svg>
      </div>
      <div class="notification-item__content">
        <div class="notification-item__title">New ${APP_CONFIG.eventTypes[event.type]?.label || 'Event'}</div>
        <div class="notification-item__text">${sanitizeHtml(event.title)}</div>
        <div class="notification-item__time">${formatRelativeTime(event.timestamp)}</div>
      </div>
    `;
    
    item.addEventListener('click', () => {
      this.showEventDetail(event);
      this.map.flyTo([event.lng, event.lat], 12);
    });
    
    const emptyMsg = list.querySelector('.notification-list__empty');
    if (emptyMsg) emptyMsg.remove();
    
    list.insertBefore(item, list.firstChild);
    
    // Show alert ticker for high severity
    if (['critical', 'high', 'major', 'pandemic'].includes(event.severity)) {
      this.showAlert(`URGENT: ${event.title}`, 'danger');
    }
  }

  showAlert(message, type = 'info') {
    const ticker = document.getElementById('alert-ticker');
    const text = ticker.querySelector('.alert-ticker__text');
    
    text.textContent = message;
    ticker.className = `alert-ticker alert-ticker--visible alert-ticker--${type}`;
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      ticker.classList.remove('alert-ticker--visible');
    }, 10000);
  }

  onEventsUpdate(events, options = {}) {
    // Render filtered list in sidebar
    this.renderEventList(events);
    
    // Send filtered events to map so time and layer filters apply visually
    this.map.updateEvents(events);
    
    if (options.newEvent) {
      this.showNotification(options.newEvent);
    }
  }
}

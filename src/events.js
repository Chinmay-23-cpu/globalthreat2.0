// ============================================
// EVENTS MODULE - Data Management & API
// ============================================

import { APP_CONFIG, API_ENDPOINTS, LAYER_PRESETS } from './config.js';
import { generateId, formatRelativeTime, parseFeed, debounce } from './utils.js';

export class EventsManager {
  constructor(options = {}) {
    this.events = [];
    this.filteredEvents = [];
    this.activeLayers = new Set(LAYER_PRESETS.default);
    this.timeRange = APP_CONFIG.timeRanges['24h'];
    this._useMockData = false;
    this.onUpdate = options.onUpdate || (() => {});
    this.onError = options.onError || (() => {});
    this.pollInterval = null;
    this.eventSource = null;
    this.lastUpdate = null;
    this.synthEvents = []; // Cache for stable synthesized events
    
    this.init();
  }

  init() {
    // Load from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const layers = urlParams.get('layers')?.split(',');
    if (layers) {
      this.activeLayers = new Set(layers);
    }
    
    const time = urlParams.get('time');
    if (time && APP_CONFIG.timeRanges[time]) {
      this.timeRange = APP_CONFIG.timeRanges[time];
    }
  }

  // Generate mock events for demo
  generateMockEvents(count = 50) {
    const types = Object.keys(APP_CONFIG.eventTypes);
    const events = [];
    const now = Date.now();
    
    const locations = [
      { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
      { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
      { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' },
      { lat: -33.8688, lng: 151.2093, name: 'Sydney, Australia' },
      { lat: 55.7558, lng: 37.6173, name: 'Moscow, Russia' },
      { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
      { lat: 52.5200, lng: 13.4050, name: 'Berlin, Germany' },
      { lat: 19.4326, lng: -99.1332, name: 'Mexico City, Mexico' },
      { lat: -23.5505, lng: -46.6333, name: 'São Paulo, Brazil' },
      { lat: 28.6139, lng: 77.2090, name: 'New Delhi, India' },
      { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
      { lat: 41.9028, lng: 12.4964, name: 'Rome, Italy' },
      { lat: 39.9042, lng: 116.4074, name: 'Beijing, China' },
      { lat: 37.5665, lng: 126.9780, name: 'Seoul, South Korea' },
      { lat: 25.2048, lng: 55.2708, name: 'Dubai, UAE' },
      { lat: -1.2921, lng: 36.8219, name: 'Nairobi, Kenya' },
      { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires, Argentina' },
      { lat: 59.9139, lng: 10.7522, name: 'Oslo, Norway' },
      { lat: 64.1466, lng: -21.9426, name: 'Reykjavik, Iceland' },
      { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro, Brazil' },
    ];

    const titles = {
      conflicts: ['Escalation in border region', 'Armed clash reported', 'Tensions rise in disputed area', 'Military buildup observed'],
      disease: ['Outbreak declared in region', 'Health emergency status', 'Vaccination campaign launched', 'Case numbers rising'],
      sanctions: ['Economic sanctions imposed', 'Trade restrictions announced', 'Asset freeze ordered', 'Diplomatic measures taken'],
      natural: [`M${(Math.random() * 5 + 3).toFixed(1)} earthquake reported`, 'Seismic activity detected', 'Severe storm warning issued', 'Wildfire spreading rapidly'],
      climate: ['Temperature record broken', 'Drought conditions worsening', 'Unusual weather pattern detected', 'Sea level rise observed']
    };

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const typeConfig = APP_CONFIG.eventTypes[type];
      const severity = typeConfig.severity[Math.floor(Math.random() * typeConfig.severity.length)];
      const titleList = titles[type];
      const title = titleList[Math.floor(Math.random() * titleList.length)];
      
      // Add some randomness to location
      const lat = location.lat + (Math.random() - 0.5) * 10;
      const lng = location.lng + (Math.random() - 0.5) * 10;
      
      // Random time within the selected range
      const hoursAgo = Math.random() * this.timeRange.hours;
      const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
      
      events.push({
        id: generateId(),
        type,
        title: `${title} - ${location.name}`,
        description: `A ${severity} level ${typeConfig.label.toLowerCase()} event has been reported in ${location.name}. Authorities are monitoring the situation and coordinating response efforts.`,
        location: location.name,
        lat,
        lng,
        severity,
        timestamp,
        source: 'Demo Data',
        url: '#',
        confidence: Math.floor(Math.random() * 40 + 60),
        affectedArea: Math.floor(Math.random() * 1000 + 10),
        lastUpdate: timestamp
      });
    }

    // Sort by timestamp (newest first)
    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async fetchRealData() {
    const events = [];
    
    try {
      // Fetch earthquakes from USGS (mapped to natural)
      if (this.activeLayers.has('natural')) {
        try {
          const earthquakeData = await parseFeed(API_ENDPOINTS.usgs);
          if (earthquakeData && earthquakeData.features) {
            earthquakeData.features.forEach(eq => {
              events.push({
                id: `usgs-${eq.id}`,
                type: 'natural',
                title: `M${eq.properties.mag} Earthquake - ${eq.properties.place}`,
                description: `A magnitude ${eq.properties.mag} earthquake occurred at ${eq.properties.place}. Depth: ${eq.geometry.coordinates[2]}km.`,
                location: eq.properties.place,
                lat: eq.geometry.coordinates[1],
                lng: eq.geometry.coordinates[0],
                severity: this.magnitudeToSeverity(eq.properties.mag),
                timestamp: new Date(eq.properties.time).toISOString(),
                source: 'USGS',
                url: eq.properties.url,
                confidence: 95,
                affectedArea: 0,
                lastUpdate: new Date().toISOString()
              });
            });
          }
        } catch (e) {
          console.warn('Failed to fetch USGS data:', e);
        }
      }

      // Fetch EONET events (wildfires, storms, etc mapping to natural/climate)
      if (this.activeLayers.has('natural') || this.activeLayers.has('climate') || this.activeLayers.has('wildfire')) {
        try {
          const eonetData = await parseFeed(API_ENDPOINTS.eonet);
          if (eonetData && eonetData.events) {
            eonetData.events.forEach(event => {
              const geometry = event.geometry[0];
              const type = this.categorizeEonetEvent(event.categories[0]?.title);
              
              if (this.activeLayers.has(type)) {
                events.push({
                  id: `eonet-${event.id}`,
                  type,
                  title: event.title,
                  description: event.description || `${event.title} - ${event.categories[0]?.title}`,
                  location: geometry.coordinates.join(', '),
                  lat: geometry.coordinates[1],
                  lng: geometry.coordinates[0],
                  severity: 'medium',
                  timestamp: geometry.date,
                  source: 'NASA EONET',
                  url: event.sources[0]?.url || '#',
                  confidence: 85,
                  affectedArea: 0,
                  lastUpdate: new Date().toISOString()
                });
              }
            });
          }
        } catch (e) {
          console.warn('Failed to fetch EONET data:', e);
        }
      }

      // Fetch intel events from Valyu AI
      const intelLayers = ['conflicts', 'disease', 'wildfire', 'climate'];
      if ([...this.activeLayers].some(l => intelLayers.includes(l))) {
        try {
          const valyuEvents = await this.fetchValyuEvents();
          
          // Fetch weather anomalies from Tomorrow.io if key is available
          const weatherEvents = await this.fetchTomorrowWeather();
          
          // Guarantee at least 20 events per active layer using Gemini synthesis
          const counts = {
            conflicts: 0,
            disease: 0,
            wildfire: 0,
            climate: 0
          };

          // Tally what we found
          const allCombinedEvents = [...valyuEvents, ...weatherEvents, ...this.synthEvents];
          allCombinedEvents.forEach(vEvent => {
            if (counts[vEvent.type] !== undefined) {
              counts[vEvent.type]++;
            }
          });
          
          const needed = {
            conflicts: Math.max(0, 20 - counts.conflicts),
            disease: Math.max(0, 20 - counts.disease),
            wildfire: Math.max(0, 20 - counts.wildfire),
            climate: Math.max(0, 20 - counts.climate)
          };
          
          if (Object.values(needed).some(n => n > 0)) {
            try {
              const newSynth = await this.generateGeminiEvents(needed);
              this.synthEvents = [...this.synthEvents, ...newSynth];
            } catch (e) {
              console.warn('Failed to generate Gemini events:', e);
            }
          }
          
          // Push everything that applies layer-wise
          [...valyuEvents, ...weatherEvents, ...this.synthEvents].forEach(evt => {
             if (this.activeLayers.has(evt.type)) {
                events.push(evt);
             }
          });
        } catch (e) {
          console.warn('Failed to fetch Valyu events:', e);
        }
      }

    } catch (error) {
      console.error('Error fetching real data:', error);
      this.onError(error);
    }

    // Final Grouping: exactly 20 events per active layer
    const groupedEvents = {};
    for (const evt of events) {
      if (!groupedEvents[evt.type]) groupedEvents[evt.type] = [];
      groupedEvents[evt.type].push(evt);
    }
    
    const limitedEvents = [];
    for (const type of this.activeLayers) {
      let typeEvents = groupedEvents[type] || [];
      // Optional: Sort by timestamp newest first to keep the best 20
      typeEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      limitedEvents.push(...typeEvents.slice(0, 20));
    }
    
    return limitedEvents;
  }

  magnitudeToSeverity(mag) {
    if (mag < 4) return 'minor';
    if (mag < 5) return 'light';
    if (mag < 6) return 'moderate';
    if (mag < 7) return 'strong';
    return 'major';
  }

  categorizeEonetEvent(category) {
    const categoryMap = {
      'Wildfires': 'wildfire',
      'Severe Storms': 'climate',
      'Volcanoes': 'natural',
      'Icebergs': 'climate',
      'Drought': 'climate',
      'Dust and Haze': 'climate'
    };
    return categoryMap[category] || 'natural';
  }

  async fetchTomorrowWeather() {
    const apiKey = process.env.VITE_TOMORROW_IO_API_KEY;
    if (!apiKey) return [];

    const events = [];
    // Tomorrow.io realtime weather needs a location. 
    // Since we want "anomalies", we'll check a few major regions including India
    const focusLocations = [
      { lat: 28.6139, lng: 77.2090, name: 'New Delhi, India' },
      { lat: 19.0760, lng: 72.8777, name: 'Mumbai, India' },
      { lat: 13.0827, lng: 80.2707, name: 'Chennai, India' },
      { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
      { lat: 51.5074, lng: -0.1278, name: 'London, UK' }
    ];

    for (const loc of focusLocations) {
      try {
        const url = `${API_ENDPOINTS.tomorrow}?location=${loc.lat},${loc.lng}&apikey=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) continue;
        
        const data = await response.json();
        const values = data.data.values;
        
        // Define what we consider an "anomaly" (e.g., extreme temp, high wind)
        if (values.temperature > 40 || values.windSpeed > 50 || values.precipitationProbability > 80) {
          events.push({
            id: `tomorrow-${loc.name.replace(/\s/g, '-')}`,
            type: 'climate',
            title: `Weather Anomaly: ${loc.name}`,
            description: `Extreme weather detected: Temp ${values.temperature}°C, Wind ${values.windSpeed}km/h, Precip Prob ${values.precipitationProbability}%`,
            location: loc.name,
            lat: loc.lat,
            lng: loc.lng,
            severity: values.windSpeed > 80 ? 'critical' : 'high',
            timestamp: new Date().toISOString(),
            source: 'Tomorrow.io',
            url: 'https://www.tomorrow.io/weather/',
            confidence: 90,
            lastUpdate: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn(`Failed to fetch Tomorrow.io data for ${loc.name}:`, e);
      }
    }
    return events;
  }

  async fetchValyuEvents() {
    const events = [];
    const apiKey = process.env.VITE_VALYU_API_KEY || 'val_595a721f47937978b103f1d656fc38ff2fcfe399e753b00ffc625ad51728e6cf';
    
    try {
      // Global intelligence multi-topic query
      const query = "breaking news conflict war geopolitical crisis diplomatic sanctions disease outbreak pandemic illness";
      
      const response = await fetch(API_ENDPOINTS.valyu, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          searchType: 'news',
          maxNumResults: 100
        })
      });

      if (!response.ok) {
        throw new Error(`Valyu API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.results || data.results.length === 0) return events;

      // Extract locations via Gemini
      const geoLocations = await this.extractLocationsViaGemini(data.results);

      data.results.forEach((result, idx) => {
        // Very basic NLP / regex categorization mapping
        let type = 'conflicts';
        const titleLower = (result.title || '').toLowerCase();
        
        if (titleLower.includes('sanction') || titleLower.includes('embargo')) type = 'sanctions';
        else if (titleLower.includes('disease') || titleLower.includes('outbreak') || titleLower.includes('pandemic') || titleLower.includes('virus')) type = 'disease';
        else type = 'conflicts';

        // Enhanced country coordinate mapping for better accuracy without LLM extraction
        const locations = [
          { lat: 48.3794, lng: 31.1656, name: 'Ukraine' },
          { lat: 55.7558, lng: 37.6173, name: 'Russia' },
          { lat: 31.0461, lng: 34.8516, name: 'Israel' },
          { lat: 31.9522, lng: 35.2332, name: 'Palestine' },
          { lat: 31.5, lng: 34.466667, name: 'Gaza' },
          { lat: 33.8547, lng: 35.8623, name: 'Lebanon' },
          { lat: 32.4279, lng: 53.6880, name: 'Iran' },
          { lat: 33.2232, lng: 43.6793, name: 'Iraq' },
          { lat: 34.8021, lng: 38.9968, name: 'Syria' },
          { lat: 15.3694, lng: 44.1910, name: 'Yemen' },
          { lat: 23.8859, lng: 45.0792, name: 'Saudi Arabia' },
          { lat: 15.5007, lng: 32.5599, name: 'Sudan' },
          { lat: 23.6978, lng: 120.9605, name: 'Taiwan' },
          { lat: 35.8617, lng: 104.1954, name: 'China' },
          { lat: 35.9078, lng: 127.7669, name: 'South Korea' },
          { lat: 40.3399, lng: 127.5101, name: 'North Korea' },
          { lat: 36.2048, lng: 138.2529, name: 'Japan' },
          { lat: 12.8797, lng: 121.7740, name: 'Philippines' },
          { lat: 20.5937, lng: 78.9629, name: 'India' },
          { lat: 30.3753, lng: 69.3451, name: 'Pakistan' },
          { lat: 33.9391, lng: 67.7099, name: 'Afghanistan' },
          { lat: 38.9072, lng: -77.0369, name: 'US' },
          { lat: 38.9072, lng: -77.0369, name: 'United States' },
          { lat: 51.5074, lng: -0.1278, name: 'UK' },
          { lat: 51.5074, lng: -0.1278, name: 'United Kingdom' },
          { lat: 46.2276, lng: 2.2137, name: 'France' },
          { lat: 51.1657, lng: 10.4515, name: 'Germany' },
          { lat: 4.2105, lng: 101.9758, name: 'Malaysia' },
          { lat: -0.7893, lng: 113.9213, name: 'Indonesia' },
          { lat: -25.2744, lng: 133.7751, name: 'Australia' },
          { lat: 23.6345, lng: -102.5528, name: 'Mexico' },
          { lat: -14.2350, lng: -51.9253, name: 'Brazil' },
          { lat: 6.4238, lng: -66.5897, name: 'Venezuela' }
        ];
        
        // Assign location from Gemini AI or fallback
        let locMap;
        if (geoLocations && geoLocations[idx] && geoLocations[idx].lat !== undefined) {
          locMap = {
            name: geoLocations[idx].name || 'Unspecified Region',
            lat: geoLocations[idx].lat,
            lng: geoLocations[idx].lng
          };
        } else {
          // Fallback: Check title FIRST, then content, to prevent false positives from generic words
          let matchedLoc = locations.find(l => {
            const regex = new RegExp(`\\b${l.name.toLowerCase()}\\b`, 'i');
            return regex.test(titleLower);
          });
          
          if (!matchedLoc && result.content) {
            matchedLoc = locations.find(l => {
              const regex = new RegExp(`\\b${l.name.toLowerCase()}\\b`, 'i');
              return regex.test(result.content.toLowerCase());
            });
          }
          
          if (matchedLoc) {
            locMap = matchedLoc;
          } else {
            locMap = locations[Math.floor(Math.random() * locations.length)];
          }
        }

        // Create consistent ID from url or title to prevent duplicates on polling
        const hashStr = (result.url || result.title || '').replace(/[^a-zA-Z0-9]/g, '');
        // Simple hash function for string
        let hash = 0;
        for (let i = 0; i < hashStr.length; i++) {
          const char = hashStr.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit int
        }

        events.push({
          id: `valyu-${Math.abs(hash)}`,
          type,
          title: result.title,
          description: result.content || result.title,
          location: locMap.name,
          lat: locMap.lat + (Math.random() - 0.5) * 5, // add jitter
          lng: locMap.lng + (Math.random() - 0.5) * 5,
          severity: 'high', // Default mapping
          timestamp: result.date || result.publication_date || new Date().toISOString(),
          source: result.source || 'Valyu Intelligence',
          url: result.url || '#',
          confidence: 90,
          lastUpdate: new Date().toISOString()
        });
      });
      
    } catch (e) {
      console.error('Failed to fetch Valyu Events:', e);
    }
    
    return events;
  }

  async callGeminiWithRetry(url, prompt, retries = 3, backoff = 2000) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (res.status === 429) {
          const wait = backoff * Math.pow(2, i);
          console.warn(`Gemini rate limited (429). Retrying in ${wait}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, wait));
          continue;
        }

        if (!res.ok) {
          throw new Error(`Gemini API Error: Status ${res.status}`);
        }

        const data = await res.json();
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Invalid Gemini response structure');
        }
        return data.candidates[0].content.parts[0].text;
      } catch (err) {
        if (i === retries - 1) throw err;
        const wait = backoff * Math.pow(2, i);
        console.warn(`Gemini call failed: ${err.message}. Retrying in ${wait}ms...`);
        await new Promise(resolve => setTimeout(resolve, wait));
      }
    }
  }

  async extractLocationsViaGemini(rawResults) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.warn('GEMINI_API_KEY not found, skipping location extraction');
      return null;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
    
    // Batch news titles into one prompt to save API calls
    const snippet = rawResults.map((r, idx) => `[${idx}] Title: ${r.title}`).join('\n');
    const prompt = `Analyze these news headlines and extract the geographic location. Return a strict JSON array of objects with keys "idx" (matching the number provided), "name" (the country or region name), "lat" (latitude decimal), and "lng" (longitude decimal). If you cannot confidently determine a location, use a generic fallback in the region or omit it by returning null for lat/lng. \nHeadlines:\n${snippet}`;

    try {
      const text = await this.callGeminiWithRetry(url, prompt);
      
      // text is guaranteed to be JSON if responseMimeType worked
      const extraction = JSON.parse(text);
      
      // Convert to a dictionary mapped by idx for easy lookup
      const map = {};
      if (Array.isArray(extraction)) {
        extraction.forEach(item => {
          if (item.idx !== undefined) map[item.idx] = item;
        });
      }
      return map;
    } catch (err) {
      console.warn('Gemini Extraction failed after retries, using local fallbacks:', err.message);
      return null;
    }
  }

  async generateGeminiEvents(needed) {
    const totalNeeded = Object.values(needed).reduce((a, b) => a + b, 0);
    if (totalNeeded <= 0) return [];
    
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.warn('GEMINI_API_KEY not found, skipping event generation');
      return [];
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
    
    const prompt = `Act as an OSINT intelligence feed. Generate realistic news events for the following categories:
${Object.entries(needed).filter(([_, count]) => count > 0).map(([type, count]) => `- ${type}: ${count} events`).join('\n')}

CRITICAL: Focus significantly on events occurring in INDIA (at least 40% of the events should be in India).
For weather anomalies (climate), include things like heatwaves, unusual floods, or severe storms.
For wildfires, include active forest fires.

Return ONLY a strict JSON array of objects with the following keys:
"type": exactly matching "conflicts", "disease", "wildfire", or "climate".
"title": realistic news headline
"description": short summary of the event
"lat": latitude decimal of the location
"lng": longitude decimal of the location
"location": name of the general region/country
"severity": one of "low", "medium", "high", "critical"

Do not include any markdown or wrapper text. Ensure total output array matches exactly ${totalNeeded} items.`;

    try {
      const text = await this.callGeminiWithRetry(url, prompt);
      const extraction = JSON.parse(text);
      if (!Array.isArray(extraction)) return [];
      
      return extraction.map(item => ({
        id: `gemini-${generateId()}`,
        type: ['disease', 'wildfire', 'conflicts', 'climate'].includes(item.type) ? item.type : 'conflicts',
        title: item.title,
        description: item.description,
        location: item.location,
        lat: item.lat,
        lng: item.lng,
        severity: item.severity || 'high',
        timestamp: new Date().toISOString(),
        source: 'Gemini OSINT Synthesis',
        url: '#',
        confidence: 85,
        lastUpdate: new Date().toISOString()
      }));
    } catch (err) {
      console.warn('Gemini Generation failed after retries:', err.message);
      return [];
    }
  }

  async loadEvents() {
    let newEvents = [];
    
    if (this._useMockData) {
      newEvents = this.generateMockEvents(60);
      this.events = newEvents;
    } else {
      // Fetch only real data - do not fall back to mock data
      try {
        newEvents = await this.fetchRealData();
      } catch (e) {
        console.error('Failed to load real data', e);
        newEvents = [];
      }
      
      // Merge with existing events to prevent flickering & disappearing
      const eventMap = new Map();
      this.events.forEach(e => eventMap.set(e.id, e));
      newEvents.forEach(e => eventMap.set(e.id, e));
      this.events = Array.from(eventMap.values());
    }

    this.applyFilters();
    // Pass filtered events for UI list, but indicate all events are available for map
    this.onUpdate(this.filteredEvents, { allEvents: this.events });
    this.lastUpdate = new Date();
  }

  applyFilters() {
    const now = Date.now();
    const cutoff = now - (this.timeRange.hours * 60 * 60 * 1000);
    
    // First filter by layer and time
    const filtered = this.events.filter(event => {
      // Filter by layer
      if (!this.activeLayers.has(event.type)) return false;
      
      // Filter by time
      const eventTime = new Date(event.timestamp).getTime();
      if (eventTime < cutoff) return false;
      
      return true;
    });

    // Group by type and limit to 20 per type (specifically for earthquakes/natural)
    const grouped = {};
    filtered.forEach(event => {
      if (!grouped[event.type]) grouped[event.type] = [];
      grouped[event.type].push(event);
    });

    const limited = [];
    Object.keys(grouped).forEach(type => {
      // Sort by timestamp newest first
      const sorted = grouped[type].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      // Limit to 20
      limited.push(...sorted.slice(0, 20));
    });

    this.filteredEvents = limited.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  setLayers(layers) {
    this.activeLayers = new Set(layers);
    this.applyFilters();
    this.onUpdate(this.filteredEvents, { allEvents: this.events, layerChange: true });
    
    // Reload if we have new layer types
    const needsReload = [...this.activeLayers].some(layer => 
      !this.events.some(e => e.type === layer)
    );
    if (needsReload) {
      this.loadEvents();
    }
  }

  setTimeRange(rangeKey) {
    if (APP_CONFIG.timeRanges[rangeKey]) {
      this.timeRange = APP_CONFIG.timeRanges[rangeKey];
      this.applyFilters();
      this.onUpdate(this.filteredEvents, { allEvents: this.events, timeChange: true });
    }
  }

  // Real-time updates via polling (SSE fallback)
  startPolling() {
    this.stopPolling();
    
    this.pollInterval = setInterval(() => {
      this.checkForUpdates();
    }, APP_CONFIG.updates.pollInterval);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // SSE connection for real-time updates
  connectSSE() {
    // In production, this would connect to your SSE endpoint
    // For demo, we simulate with periodic mock updates
    this.simulateRealtimeUpdates();
  }

  simulateRealtimeUpdates() {
    // Simulate new events coming in
    this.sseInterval = setInterval(() => {
      // ONLY simulate if mock data is enabled!
      if (!this._useMockData) return;
      
      if (Math.random() > 0.7) { // 30% chance every interval
        const newEvent = this.generateMockEvents(1)[0];
        newEvent.timestamp = new Date().toISOString();
        newEvent.title = `[NEW] ${newEvent.title}`;
        
        this.events.unshift(newEvent);
        this.applyFilters();
        this.onUpdate(this.filteredEvents, { newEvent });
      }
    }, 15000); // Every 15 seconds
  }

  async checkForUpdates() {
    // Check for updates from APIs
    if (!this._useMockData) {
      await this.loadEvents();
    }
  }

  getEventById(id) {
    return this.events.find(e => e.id === id);
  }

  useMockData(enabled) {
    this._useMockData = enabled;
    this.loadEvents();
  }

  destroy() {
    this.stopPolling();
    if (this.sseInterval) {
      clearInterval(this.sseInterval);
    }
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

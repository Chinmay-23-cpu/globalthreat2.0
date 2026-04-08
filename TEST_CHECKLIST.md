# World Events Monitor - Test Checklist & Acceptance Criteria

## Pre-Flight Checks

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts server on port 5173
- [ ] No console errors on initial load

---

## Core Functionality Tests

### Map Rendering
- [ ] Map loads with dark base tiles (MapLibre GL)
- [ ] Map fills entire viewport on desktop
- [ ] Map is visible on mobile devices
- [ ] Map responds to zoom controls (+/-)
- [ ] Map resets to default view on "reset" button
- [ ] Smooth zoom/pan animations work

### Event Layer Rendering
- [ ] Events appear as colored circles on map
- [ ] Event colors match type (red=conflict, orange=military, etc.)
- [ ] Clusters form when multiple events are close together
- [ ] Cluster shows count number
- [ ] Clicking cluster zooms to expand
- [ ] Events update when layers are toggled

### Layer Controls
- [ ] Layer panel is visible on desktop
- [ ] All 8 layer types can be toggled on/off
- [ ] Opacity sliders adjust layer visibility
- [ ] Preset buttons (Security Focus, Natural Events, All) work
- [ ] Reset button returns to default layers
- [ ] Layer states persist in URL parameters

### Time Controls
- [ ] Time range buttons (24h, 7d, 30d) filter events
- [ ] Play button animates timeline
- [ ] Pause button stops animation
- [ ] Slider scrubs through time range
- [ ] Time display updates correctly

### Event List Panel
- [ ] Event list shows on right side (desktop)
- [ ] Event count badge updates correctly
- [ ] Events sort by newest first (default)
- [ ] Event cards show: icon, title, severity, location, timestamp
- [ ] Severity badges are color-coded
- [ ] Clicking event centers map and opens detail

### Event Detail Overlay
- [ ] Clicking map event opens detail card
- [ ] Clicking list event opens detail card
- [ ] Detail shows: title, severity, location, timestamp, description, stats
- [ ] "View Source" button opens external link
- [ ] Close button dismisses overlay
- [ ] Escape key closes overlay
- [ ] Clicking backdrop closes overlay

### Search Functionality
- [ ] Search box accepts text input
- [ ] Results appear after typing 2+ characters
- [ ] Results include location suggestions
- [ ] Clicking result flies map to location
- [ ] "F" key focuses search input
- [ ] Search closes on outside click

### Alert Ticker
- [ ] High-severity events trigger alert banner
- [ ] Alert banner appears at top of screen
- [ ] Alert shows warning icon and message
- [ ] Close button dismisses alert
- [ ] Auto-dismisses after 10 seconds

### Notifications
- [ ] New events trigger notification badge
- [ ] Badge count increments correctly
- [ ] Clicking bell icon opens notification panel
- [ ] Panel shows recent notifications
- [ ] Clicking notification opens event detail
- [ ] Opening panel clears badge

---

## Responsive Design Tests

### Desktop (≥1024px)
- [ ] Both sidebars visible simultaneously
- [ ] Header shows full title
- [ ] Search bar shows keyboard shortcut hint
- [ ] Map has full width between panels

### Tablet (640px-1023px)
- [ ] Sidebars slide in from edges
- [ ] Menu button toggles left panel
- [ ] Filter button toggles right panel
- [ ] Panels overlay map (not push)
- [ ] Map controls remain accessible

### Mobile (<640px)
- [ ] Header collapses to icon-only
- [ ] Sidebars are hidden by default
- [ ] Menu button (☰) visible
- [ ] Time controls are compact
- [ ] Event list becomes bottom sheet
- [ ] Detail overlay slides from bottom
- [ ] All touch targets ≥44px

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab navigates through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate within groups
- [ ] Escape closes panels and overlays
- [ ] Focus indicators visible on all elements
- [ ] Skip-to-content link available (if applicable)

### Screen Reader Support
- [ ] ARIA labels on icon-only buttons
- [ ] Map has role="application" and aria-label
- [ ] Event cards have role="article"
- [ ] Panel regions properly labeled
- [ ] Live regions for alerts
- [ ] Modal dialogs properly marked

### Visual Accessibility
- [ ] WCAG AA contrast ratio met (4.5:1 for text)
- [ ] Focus indicators have 2px solid outline
- [ ] Color is not sole indicator (icons + text)
- [ ] Reduced motion preferences respected
- [ ] Text scales with browser zoom

---

## Data & Real-time Tests

### Initial Data Load
- [ ] Events load within 2 seconds
- [ ] Loading state shown during fetch
- [ ] Error state shown on failure
- [ ] Empty state shown when no events match

### Real-time Updates
- [ ] New events appear automatically
- [ ] Notification shown for new events
- [ ] Map updates without full refresh
- [ ] Event list updates correctly
- [ ] Badge counter increments

### Offline/Error Handling
- [ ] Friendly error message on network failure
- [ ] Automatic retry with exponential backoff
- [ ] Graceful degradation when APIs fail
- [ ] Mock data mode available (`EVENTS_API.useMockData(true)`)

---

## Performance Tests

### Load Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No layout shift during load
- [ ] Map tiles load progressively

### Runtime Performance
- [ ] 60fps during map pan/zoom
- [ ] Smooth animations (150-350ms)
- [ ] No memory leaks (stable over time)
- [ ] Efficient re-renders (no thrashing)

### Bundle Size
- [ ] Main bundle < 500KB (gzipped)
- [ ] MapLibre loaded from CDN
- [ ] Code split by route (if applicable)

---

## Browser Compatibility

### Chrome 90+
- [ ] All features work correctly

### Firefox 88+
- [ ] All features work correctly

### Safari 14+
- [ ] All features work correctly
- [ ] CSS backdrop-filter works

### Edge 90+
- [ ] All features work correctly

### Mobile Browsers
- [ ] iOS Safari: touch gestures work
- [ ] Chrome Android: touch gestures work
- [ ] Pull-to-refresh disabled on map

---

## URL State Tests

### Parameter Persistence
- [ ] Map center/lat/lng in URL
- [ ] Zoom level in URL
- [ ] Active layers in URL
- [ ] Time range in URL
- [ ] State restores on page reload

### Shareable Links
- [ ] Copy URL shares exact view
- [ ] Another user opening URL sees same view
- [ ] Invalid parameters handled gracefully

---

## Console/Debug Tests

### Developer Console
- [ ] No errors on initial load
- [ ] No warnings about deprecated APIs
- [ ] Helpful console messages for debugging
- [ ] `EVENTS_API` methods documented

### Console Commands Work
```javascript
// Test these in browser console:
EVENTS_API.useMockData(true)    // Enable mock data
EVENTS_API.useMockData(false)   // Disable mock data
EVENTS_API.setLayers(['conflicts', 'wildfires'])
EVENTS_API.flyTo(35.6762, 139.6503, 10)
EVENTS_API.resetView()
EVENTS_API.getState()
```

---

## Build & Deploy Tests

### Development Build
- [ ] `npm run dev` works
- [ ] Hot reload functions
- [ ] Source maps available

### Production Build
- [ ] `npm run build` completes without errors
- [ ] `dist/` folder created
- [ ] `npm run preview` serves built files
- [ ] All assets load correctly
- [ ] No broken references

---

## Sign-Off Criteria

### Minimum for MVP
- Map loads and displays events
- Layer toggles work
- Event details open
- Mobile layout usable
- No console errors

### Full Acceptance
- All tests above pass
- Performance metrics met
- Accessibility audit passed
- Cross-browser verified
- Documentation complete

---

## Known Limitations

1. **API Rate Limits**: Free APIs (USGS, EONET) may have rate limits; mock data available as fallback
2. **Geocoding**: Nominatim requires attribution and has usage limits
3. **SSE Support**: Real SSE requires backend; current implementation uses polling + simulation
4. **Offline Mode**: No offline support; requires network connection

---

## Test Run Record

| Date | Tester | Browser | Result | Notes |
|------|--------|---------|--------|-------|
| | | | | |
| | | | | |
| | | | | |

---

## Bug Report Template

**Issue:** [Brief description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** 
**Actual:** 
**Browser:** 
**Screenshot:** [If applicable]

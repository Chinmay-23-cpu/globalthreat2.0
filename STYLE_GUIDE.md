# World Events Monitor - Style Guide

## Brand Identity

**Tone**: Professional, credible, editorial + data dashboard aesthetic. Dark, sophisticated interface conveying urgency without alarmism.

---

## Color Palette

### Primary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-bg-primary` | `#0d1117` | `rgb(13, 17, 23)` | Main background |
| `--color-bg-secondary` | `#161b22` | `rgb(22, 27, 34)` | Panel backgrounds |
| `--color-bg-tertiary` | `#21262d` | `rgb(33, 38, 45)` | Elevated surfaces |
| `--color-bg-elevated` | `#30363d` | `rgb(48, 54, 61)` | Cards, modals |

### Accent Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-accent-primary` | `#58a6ff` | `rgb(88, 166, 255)` | Primary actions, info |
| `--color-accent-success` | `#238636` | `rgb(35, 134, 54)` | Success states |
| `--color-accent-warning` | `#d29922` | `rgb(210, 153, 34)` | Warnings |
| `--color-accent-danger` | `#da3633` | `rgb(218, 54, 51)` | Critical alerts |
| `--color-accent-highlight` | `#a371f7` | `rgb(163, 113, 247)` | Highlights |

### Event Type Colors (Map Markers)

| Event Type | Hex | RGB |
|------------|-----|-----|
| `--event-conflict` | `#ff6b6b` | `rgb(255, 107, 107)` |
| `--event-military` | `#ff9f43` | `rgb(255, 159, 67)` |
| `--event-climate` | `#00d2d3` | `rgb(0, 210, 211)` |
| `--event-weather` | `#54a0ff` | `rgb(84, 160, 255)` |
| `--event-wildfire` | `#ff6b6b` | `rgb(255, 107, 107)` |
| `--event-sanctions` | `#feca57` | `rgb(254, 202, 87)` |
| `--event-disease` | `#ff9ff3` | `rgb(255, 159, 243)` |
| `--event-natural` | `#48dbfb` | `rgb(72, 219, 251)` |

### Text Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--text-primary` | `#f0f6fc` | `rgb(240, 246, 252)` | Primary text |
| `--text-secondary` | `#8b949e` | `rgb(139, 148, 158)` | Secondary text |
| `--text-tertiary` | `#6e7681` | `rgb(110, 118, 129)` | Muted text |
| `--text-link` | `#58a6ff` | `rgb(88, 166, 255)` | Links |

### Map Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--map-water` | `#0d1117` | Water bodies |
| `--map-land` | `#161b22` | Land areas |
| `--map-border` | `#30363d` | Country borders |
| `--map-label` | `#8b949e` | Place labels |

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 | 32px (2rem) | 700 | 1.2 | -0.02em |
| H2 | 24px (1.5rem) | 600 | 1.3 | -0.01em |
| H3 | 20px (1.25rem) | 600 | 1.4 | 0 |
| H4 | 16px (1rem) | 600 | 1.4 | 0 |
| Body | 16px (1rem) | 400 | 1.5 | 0 |
| Body Small | 14px (0.875rem) | 400 | 1.5 | 0 |
| Caption | 12px (0.75rem) | 400 | 1.4 | 0.01em |
| Label | 11px (0.6875rem) | 600 | 1.2 | 0.02em |

### Typography Patterns

- **Labels/Tags**: Uppercase, 11px, semibold, letter-spacing 0.02em
- **Navigation**: 14px, medium weight
- **Event Titles**: 16px, semibold
- **Timestamps**: 12px, regular, muted color

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Minimal gaps |
| `--space-2` | 8px | Tight spacing |
| `--space-3` | 12px | Default element spacing |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 24px | Section padding |
| `--space-6` | 32px | Large gaps |
| `--space-8` | 48px | Major sections |
| `--space-10` | 64px | Page-level spacing |

---

## Border & Elevation

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Tags, small elements |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards, panels |
| `--radius-xl` | 12px | Modals, overlays |

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 20px rgba(88, 166, 255, 0.3);
```

### Backdrop Blur

```css
--blur-panel: blur(12px) saturate(180%);
--blur-overlay: blur(20px) saturate(200%);
```

---

## Components

### Buttons

**Primary Button**
- Background: `--color-accent-primary`
- Text: `#ffffff`
- Padding: 8px 16px
- Border-radius: 6px
- Font: 14px, weight 500
- Hover: 10% lighter, subtle glow

**Secondary Button**
- Background: `--color-bg-tertiary`
- Border: 1px solid `--color-bg-elevated`
- Text: `--text-primary`
- Hover: Background lightens 5%

**Ghost Button**
- Background: transparent
- Text: `--text-secondary`
- Hover: Background `--color-bg-tertiary`, text `--text-primary`

### Cards

**Event Card**
- Background: `--color-bg-secondary`
- Border: 1px solid `--color-bg-elevated`
- Border-radius: 8px
- Padding: 16px
- Shadow: `--shadow-sm`
- Hover: Border color `--color-accent-primary`, shadow `--shadow-md`

**Detail Panel**
- Background: `--color-bg-secondary` with `--blur-panel`
- Border-right: 1px solid `--color-bg-elevated`
- Width: 400px (desktop), 100% (mobile)

### Inputs

**Search Input**
- Background: `--color-bg-tertiary`
- Border: 1px solid `--color-bg-elevated`
- Border-radius: 8px
- Padding: 10px 16px
- Focus: Border `--color-accent-primary`, glow shadow

**Slider**
- Track: `--color-bg-elevated`
- Fill: `--color-accent-primary`
- Thumb: 16px circle, white with shadow

### Map Markers

**Standard Marker**
- Size: 24px
- Shape: Circle with icon
- Border: 2px solid white
- Shadow: `--shadow-md`

**Pulse Animation** (for recent events)
```css
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}
```

**Cluster Marker**
- Size: Scales with count (40px - 80px)
- Background: Semi-transparent accent color
- Text: White, 14px bold
- Border: 2px solid white

---

## Layout

### Grid System

12-column grid for desktop (≥1024px):
- Gap: 24px
- Max-width: 100% (full viewport)

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px | Single column, collapsible panels |
| Tablet | 640px - 1023px | 2-column, slide-out panels |
| Desktop | ≥ 1024px | Full layout with sidebars |

### Z-Index Scale

| Layer | Z-Index | Element |
|-------|---------|---------|
| Map | 0 | Base map canvas |
| Markers | 100 | Event markers |
| UI Panels | 200 | Sidebars, controls |
| Overlays | 300 | Modals, detail cards |
| Alerts | 400 | Notification banners |
| Popovers | 500 | Tooltips, dropdowns |

---

## Animations

### Transitions

| Duration | Usage |
|----------|-------|
| 150ms | Hover states, micro-interactions |
| 250ms | Panel open/close, modal |
| 350ms | Page transitions, map fly-to |

### Easing

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Key Animations

**Panel Slide**
```css
@keyframes slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

**Fade In**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Marker Pulse** (for high-priority events)
```css
@keyframes markerPulse {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50% { box-shadow: 0 0 0 8px transparent; }
}
```

---

## Accessibility

### Contrast Requirements

- Normal text: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

### ARIA Patterns

- Map: `role="application"`, `aria-label="Interactive world map"`
- Panels: `role="complementary"` or `role="dialog"`
- Alerts: `role="alert"`, `aria-live="polite"`
- Buttons: Always include `aria-label` for icon-only buttons

---

## Iconography

- **Style**: Outlined, 2px stroke, rounded caps
- **Size**: 16px (small), 20px (default), 24px (large)
- **Format**: SVG inline or sprite
- **Color**: Inherits from text color via `currentColor`

### Icon Set (Custom SVG)

- `icon-conflict` - Crossed swords
- `icon-military` - Tank/jet
- `icon-climate` - Thermometer/waves
- `icon-weather` - Cloud/lightning
- `icon-wildfire` - Flame
- `icon-sanctions` - Blocked coin
- `icon-disease` - Biohazard
- `icon-natural` - Mountain/wave
- `icon-location` - Map pin
- `icon-clock` - Clock
- `icon-calendar` - Calendar
- `icon-search` - Magnifying glass
- `icon-filter` - Funnel
- `icon-layers` - Stacked squares
- `icon-close` - X
- `icon-menu` - Hamburger
- `icon-chevron` - Arrow
- `icon-play` - Play triangle
- `icon-pause` - Pause bars
- `icon-refresh` - Circular arrow

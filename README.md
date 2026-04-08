# Global Threats Monitor

A premium, real-time world events monitoring interface with interactive mapping, AI-powered intelligence synthesis, and live updates.

## Features

- **Interactive Map**: Leaflet-based global map with high-performance clustering and real-time markers.
- **AI-Powered Intelligence**: Integrates **Google Gemini 2.0 Flash** for:
  - **OSINT Synthesis**: Generating realistic intelligence for conflict zones and disease outbreaks.
  - **Location Extraction**: Automatically extracting geographic coordinates from news headlines.
- **Event Layers**:
  - **Conflicts**: Real-time monitoring of global armed conflicts.
  - **Disease Outbreaks**: Tracking health emergencies and outbreaks.
  - **Wildfires**: Live data from NASA EONET.
  - **Earthquakes**: Real-time seismic data from USGS.
  - **Weather Events**: Severe storm and climate monitoring.
- **Interactive Legend**: Top-left control panel to toggle visibility of specific threat categories.
- **Intelligence Feed**: A searchable, filterable list of the latest global events with severity ratings and source links.
- **Resilient API Handling**: Robust retry logic with exponential backoff for Gemini API calls to handle rate limits (429 errors).

## Quick Start

### Prerequisites

- Node.js (v18+)
- A Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/POSID3N/Global-Threats.git
   cd Global-Threats
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture

```
src/
├── main.js           # Application entry point
├── map.js            # Leaflet initialization and layer management
├── events.js         # Event data management, API fetching, and Gemini integration
├── ui.js             # UI component handlers and event listeners
├── utils.js          # Helper functions and data parsers
└── config.js         # Global configuration, API endpoints, and event types
```

## License

MIT License - See LICENSE file for details.

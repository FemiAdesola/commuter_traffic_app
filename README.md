<div align="center">

<!-- Terminal header -->
<div style="background:#2d2d2d; border-radius:8px 8px 0 0; padding:8px 12px; text-align:left; color:#ccc; font-family:Menlo, monospace;">
  <span style="color:#ff5f56;">●</span>
  <span style="color:#ffbd2e;">●</span>
  <span style="color:#27c93f;">●</span>
  <span style="margin-left:8px;"> 🚆 Commuter Traffic App</span>
</div>
<!-- Terminal body -->
<div style="background:#1e1e1d; padding:16px; color:#d1d1d1; text-align:left; font-family:Menlo, monospace; font-size:14px; border-radius:0 0 8px 8px; overflow:auto;">
<pre>

## 🚆 Project Goal

<p> This is JavaScript + API project that demonstrates skills with AJAX, the Fetch API, and DOM manipulation without relying on frameworks


- Create a web app where a user can:
    - Select or search a train station (e.g., "Helsinki")
    - Fetch live train timetable data from the Digitraffic API
    - Display upcoming arrival, departures, destinations, and delays
    - Show loading/error states for better UX

---


# 🚆 Documentation for Train Live Timetables Web App

> This is dark-themed **real-time train timetable dashboard** built using **HTML**, **CSS**, and **JavaScript**.  
It connects to the **Digitraffic Open API** to show **live arrival and departure information** for all train stations across Finland.

<code style="color : greenyellow"><strong>Click to view the website link [here](https://femi-commuter-traffic-app.netlify.app/)</strong></code>


---
## Front page
| Desktop view | Mobile view|
|-------------|--------------|
| ![commuter_traffic_app](/img/FrontPage.png) | ![MobileView](/img/MobileView.png) |

---

---
## Dropdown and Search
| Dropdown | Search|
|-------------|--------------|
| ![Dropdown](/img/Dropdown.png) | ![Search](/img/Search.png) |

---

## Overview

This web app provides up-to-date live train data in a visually modern dashboard format.  
It allows users to:
- Search by station name or select from a dropdown.
- View real-time arrivals and departures.
- Track on-time and delayed trains.
- Toggle between current and past trains.
- Enjoy smooth animations and a clean, responsive UI.

---

## Features

✅ **Live Data Fetching** — Displays real-time train arrivals and departures from [Digitraffic API](https://rata.digitraffic.fi).  
✅ **Search by Station** — Type or select any Finnish train station.  
✅ **Smart Filtering** — Only shows trains within a 4-hour time frame.  
✅ **Auto Refresh** — Updates data every 45 seconds automatically.  
✅ **Responsive Design** — Works seamlessly on desktops, tablets, and mobile devices.  
✅ **Interactive UI** — Dropdown search, hover effects, and animated cards.

---

## Tech Stack

| Layer | Technology |
|:------|:------------|
| Frontend | HTML5, CSS3 (Dark Gradient + Neon Glow Theme) |
| Logic | Vanilla JavaScript (ES6+) |
| API | Digitraffic Railway Open Data API |
| Tools | Fetch API, DOM Manipulation, Responsive Layouts |

---

## API Overview

+ Endpoint example:
```js
    https://rata.digitraffic.fi/api/v1/live-trains/station/<STATION_SHORTCODE>?departing_trains=5
```
+ Station list API:
```js
    https://rata.digitraffic.fi/api/v1/metadata/stations
```

## Installation

### Windows Setup

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/FemiAdesola/commuter_traffic_app.git
   or 
   download the ZIP file and extract it.
   ```
2. Navigate into the project folder:
   ```bash
   cd commuter_traffic_app
   ```
3. Open `index.html` directly in your browser by double-clicking it  
   **or** right-click → *Open with* → *Chrome/Edge/Firefox*.

4. (Optional) For a local server (recommended):
   ```bash
   npx serve
   ```
   Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

### macOS Setup

1. Open **Terminal** and clone the repository:
   ```bash
   git clonehttps://github.com/FemiAdesola/commuter_traffic_app.git
   or 
   download the ZIP file and extract it.
   ```
2. Move into the project directory:
   ```bash
   cd commuter_traffic_app
   ```
3. Launch using the built-in Python server (no extra installs needed):
   ```bash
   python3 -m http.server
   ```
4. Open your browser and go to:
   ```
   http://localhost:8000
   ```
---

## Usage

1. Open the web app (via `index.html` or local server).  
2. Type a **station name** (e.g., *Helsinki*, *Tampere*, *Oulu*).  
3. Or, use the **dropdown** to select from available stations.  
4. View:
   - **Train numbers**, **arrival**, **departure**, and **status (on-time or delayed)**.  
   - Past trains by toggling **“Show Past Trains.”**  
5. The app refreshes automatically every **45 seconds**.

### Usage instruction in details
> The dashboard uses AJAX (implemented with the modern fetch() API) to retrieve and update live train information from the Digitraffic Open Railway API without reloading the page. When a user selects a station, the app sends an asynchronous request to fetch the latest arrivals and departures. The script then calculates a 4-hour viewing window — two hours before and two hours after the current time and filters the train data to show only those operating within that range. This ensures the dashboard always displays up-to-date and relevant schedules.

> If no trains are available during that period, a friendly message is shown instead of empty results. By handling this data asynchronously, the app maintains a smooth, uninterrupted experience for the user, dynamically updating the content in real time while preserving the overall page structure and visual flow.

---
## Live trains & Past trains
| Live train | Past train|
|-------------|--------------|
| ![Live train](/img/LiveTrain.png) | ![Past train](/img/PastTrain.png) |

---

## Project Structure

```bash
commuter_traffic_app/
├── .github/
│   └── workflows/      # Contains GitHub Actions workflow files
│       └── commuter_traffic.yml   # GitHub actions CI/CD
├── assets/
│   └── styles.css      # Stylesheet (main CSS file that defines the visual styling of the web application)
├── img/                # Contains image assets used in the application.
│   ├── Dropdown.png
│   ├── FrontPage.png
│   ├── LiveTrain.png
│   ├── MobileView.png
│   ├── Not-Found.png
│   ├── PastTrain.png
│   └── Search.png
├── js/
│   └── app.js       # JavaScript logic
├── .gitignore
├── index.html            # Main HTML file
└── README.md           # Project documentation
```

## UI Theme

Inspired by **modern fintech dashboards** like NeuroBank, featuring:
- Deep navy background (`#0e0e12`, `#13131a`)
- Blue-to-violet gradient accents (`#6004eb → #e08f0e`)
- Smooth shadows, glowing cards, and responsive spacing

---

## API Reference

All data is fetched from the [Digitraffic Open Railway API](https://rata.digitraffic.fi/api/v1/).  
Example endpoints used:

- **Stations:**  
```js
  https://rata.digitraffic.fi/api/v1/metadata/stations
```

- **Live Trains:**  
```js
  https://rata.digitraffic.fi/api/v1/live-trains/station/{STATION_CODE}?arriving_trains=20&departing_trains=20&include_nonstopping=false
```

---

## Troubleshooting

| Issue | Solution |
|:------|:----------|
| Failed to load station data. | Check your internet connection or API availability. |
| Dropdown not showing options | Wait a few seconds for stations to load after page load. |
| Delays not updating | Refresh manually (click “Search” again). |

---
## Future Enhancements
- Add Finnish/English language switch.  
- Deploy as PWA for mobile offline access.  

---
## Author
**Developed by:** Femi Adesola\
**API Data Source:** [Digitraffic Railway API](https://rata.digitraffic.fi)  

---
</pre>
</div>

</div>
# Commuter Traffic App
> This is JavaScript + API project that demonstrates skills with AJAX, the Fetch API, and DOM manipulation without relying on frameworks

## 🚆 Project Goal

- Create a web app where a user can:
    - Select or search a train station (e.g., "Helsinki")
    - Fetch live train timetable data from the Digitraffic API
    - Display upcoming arrival, departures, destinations, and delays
    - Show loading/error states for better UX

## 🌐 API Overview

+ Endpoint example:
```js
    https://rata.digitraffic.fi/api/v1/live-trains/station/<STATION_SHORTCODE>?departing_trains=5
```
+ Station list API:
```js
    https://rata.digitraffic.fi/api/v1/metadata/stations
```


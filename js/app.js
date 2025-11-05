/*
  app.js
  This file controls all logic for the live train dashboard.
  It:
  - Fetches live train and station data from the Digitraffic API.
  - Updates the UI dynamically.
  - Displays live clock and automatically refreshes data every 45 seconds.
*/

// ================================
// 1️⃣ FETCH DOM ELEMENTS
// ================================

// These variables store references to specific elements in the HTML.
// They let us modify the page using JavaScript later.
const stationInput = document.getElementById("stationInput");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const currentTimeDisplay = document.getElementById("currentTime");
const timeRangeDisplay = document.getElementById("timeRange");
const togglePastBtn = document.getElementById("togglePastBtn");
const pastSection = document.getElementById("past-section");
const pastTrainsDiv = document.getElementById("pastTrains");
const customSelect = document.getElementById("customSelect");
const selected = customSelect.querySelector(".selected");
const optionsContainer = document.getElementById("stationOptions");

// ================================
// 2️⃣ DEFINE VARIABLES
// ================================

// Will hold all station data once loaded from API.
let stations = [];

// Used to refresh data automatically every 45 seconds.
let refreshInterval;

// Used to remember whether past trains are being shown or hidden.
let showAllPast = false;

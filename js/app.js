/*
  app.js
  This file controls all logic for the live train dashboard.
  It:
  - Fetches live train and station data from the Digitraffic API.
  - Updates the UI dynamically.
  - Displays live clock and automatically refreshes data every 45 seconds.
*/

// ================================
//  FETCH DOM ELEMENTS
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
//  DEFINE VARIABLES
// ================================

// Will hold all station data once loaded from API.
let stations = [];

// Used to refresh data automatically every 45 seconds.
let refreshInterval;

// Used to remember whether past trains are being shown or hidden.
let showAllPast = false;

// ================================
//  INITIAL SETUP (runs on page load)
// ================================

// "DOMContentLoaded" means this code runs only after the HTML is fully loaded.
window.addEventListener("DOMContentLoaded", async () => {
  // Start the live digital clock immediately.
  updateClock();

  // Update the clock every 1 second.
  setInterval(updateClock, 1000);

  try {
    // Fetch all station metadata from Finland’s open railway API.
    const response = await fetch(
      "https://rata.digitraffic.fi/api/v1/metadata/stations"
    );

    // Convert the fetched JSON response to an array of stations.
    stations = await response.json();

    // console.log("Fetched stations:", stations); // console log to see data Add here

    // Populate the dropdown menu with station names.
    populateStationSelect(stations);
  } catch {
    // If something goes wrong (e.g., no internet), show an error message.
    showError("❌ Failed to load station data.");
  }
});

// ================================
//  CREATE DROPDOWN OPTIONS
// ================================
function populateStationSelect(stations) {
  // Clear any previous options.
  optionsContainer.innerHTML = "";

  // Loop through every station and make a clickable div for each one.
  stations.forEach((st) => {
    console.log("Creating option for:", st.stationName, st.stationShortCode); // for seeing each station
    const optionDiv = document.createElement("div");
    optionDiv.textContent = st.stationName; // Display station name
    optionDiv.dataset.code = st.stationShortCode; // Save short code for API
    optionDiv.classList.add("option");

    // When the user clicks an option:
    optionDiv.addEventListener("click", () => {
      console.log("Selected station:", st.stationName, st.stationShortCode); // to see selected station
      selected.textContent = st.stationName; // Show name on dropdown
      stationInput.value = st.stationName; // Fill text box with name
      optionsContainer.classList.add("hidden"); // Close dropdown list
    });

    // Add this option to the dropdown container.
    optionsContainer.appendChild(optionDiv);
  });
}

// ================================
//  DROPDOWN BEHAVIOR
// ================================

// Open or close dropdown when the user clicks the selected area.
customSelect.addEventListener("click", (e) => {
  if (e.target.classList.contains("selected")) {
    optionsContainer.classList.toggle("hidden");
  }
});

// Close dropdown when clicking anywhere outside it.
document.addEventListener("click", (e) => {
  if (!customSelect.contains(e.target)) {
    optionsContainer.classList.add("hidden");
  }
});

// ================================
//  HELPER FUNCTIONS
// ================================

// Updates the live clock text in the sidebar.
function updateClock() {
  const now = new Date();
  currentTimeDisplay.textContent = `Current Time: ${now.toLocaleTimeString()}`;
}

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
const themeToggleBtn = document.getElementById("themeToggleBtn");

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
// THEME TOGGLE LOGIC
// ================================

// Load saved theme preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-theme");
  themeToggleBtn.textContent = "☀️";
} else {
  themeToggleBtn.textContent = "🌙";
}

// Toggle theme on click
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");

  const isLight = document.body.classList.contains("light-theme");
  themeToggleBtn.textContent = isLight ? "☀️" : "🌙";

  // Save preference
  localStorage.setItem("theme", isLight ? "light" : "dark");
});


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
// AUTOCOMPLETE SEARCH (Typing)
// ================================
stationInput.addEventListener("input", () => {
  // Take what the user typed and make it lowercase for easier comparison.
  const query = stationInput.value.trim().toLowerCase();

  // Select all dropdown options currently visible.
  const options = document.querySelectorAll("#stationOptions .option");

  // If input is cleared, reset everything.
  if (!query) {
    options.forEach((opt) => (opt.style.display = "block")); // show all
    selected.textContent = "-- Select a station --"; // reset dropdown label
    optionsContainer.classList.add("hidden");
    resultsDiv.innerHTML = "";
    timeRangeDisplay.textContent = "";
    pastSection.classList.add("hidden");
    errorDiv.classList.add("hidden");
    return;
  }

  // Filter dropdown options based on user input.
  let anyMatch = false;
  options.forEach((opt) => {
    const match = opt.textContent.toLowerCase().includes(query);
    opt.style.display = match ? "block" : "none";
    if (match) anyMatch = true;
  });

  // Show dropdown if at least one match exists.
  if (anyMatch) optionsContainer.classList.remove("hidden");
  else optionsContainer.classList.add("hidden");

  // Update dropdown label text to show closest match.
  const found = stations.find(
    (st) =>
      st.stationName.toLowerCase() === query ||
      st.stationName.toLowerCase().startsWith(query)
  );
  selected.textContent = found ? found.stationName : "-- Select a station --";
});

// ================================
// SEARCH EVENT HANDLING
// ================================
searchBtn.addEventListener("click", handleSearch);

// Pressing Enter also triggers search.
stationInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

// Show or hide past trains when button is clicked.
togglePastBtn.addEventListener("click", () => {
  showAllPast = !showAllPast; // toggle boolean
  pastTrainsDiv.classList.toggle("hidden", !showAllPast);
  togglePastBtn.textContent = showAllPast
    ? "Hide Past Trains"
    : "Show Past Trains";
});

// ================================
// HANDLE SEARCH FUNCTION
// ================================
async function handleSearch() {
  clearInterval(refreshInterval); // Stop any previous auto-refresh
  errorDiv.classList.add("hidden"); // Hide old error messages

  // Get typed text and dropdown-selected station.
  const query = stationInput.value.trim().toLowerCase();
  const selectedStation = selected.textContent.trim();

  // If both are empty, show warning.
  if (!query && selectedStation === "-- Select a station --") {
    showError("⚠️ Please enter or choose a station.");
    return;
  }

  // Find matching station object from the API data.
  const found = stations.find((st) => {
    const name = st.stationName.toLowerCase();
    return (
      name === query ||
      name.startsWith(query) ||
      name === selectedStation.toLowerCase()
    );
  });

  // If no valid station was found, show an error.
  if (!found) {
    showError("❌ Station not found.");
    return;
  }

  // Fetch live train data for the chosen station.
  await fetchTrainData(found.stationShortCode, found.stationName);

  // Refresh every 45 seconds to stay up-to-date.
  refreshInterval = setInterval(
    () => fetchTrainData(found.stationShortCode, found.stationName),
    45000
  );

  // Close the dropdown menu.
  optionsContainer.classList.add("hidden");
}

// ================================
// FETCH TRAIN DATA FROM API
// ================================
async function fetchTrainData(stationCode, stationName) {
  // Clear old results and show the loading message.
  resultsDiv.innerHTML = "";
  loading.classList.remove("hidden");
  errorDiv.classList.add("hidden");

  try {
    // Fetch live arrivals/departures for the selected station.
    const response = await fetch(
      `https://rata.digitraffic.fi/api/v1/live-trains/station/${stationCode}?arriving_trains=20&departing_trains=20&include_nonstopping=false`
    );
    const trains = await response.json();

    // Hide loading once data arrives.
    loading.classList.add("hidden");

    // Define a 4-hour window: 2 hours before and after now.
    const now = new Date();
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Display this time window in the UI.
    timeRangeDisplay.textContent = `Showing trains from: ${startTime.toLocaleTimeString(
      [],
      {month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }
    )} – ${endTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    // Filter trains whose schedule falls within the current 4-hour range.
    const filtered = trains.filter((train) =>
      train.timeTableRows.some(
        (row) =>
          row.stationShortCode === stationCode &&
          new Date(row.scheduledTime) >= startTime &&
          new Date(row.scheduledTime) <= endTime
      )
    );

    // If no trains are found, show a message.
    if (!filtered.length) {
      resultsDiv.innerHTML = `<p>No trains found for ${stationName} in this time window.</p>`;
      return;
    }

    // Add title to the results section.
    resultsDiv.innerHTML = `<h2>Live Arrivals & Departures for ${stationName} station</h2>`;

    // Sort trains chronologically by scheduled time.
    filtered.sort((a, b) => {
      const aRow = a.timeTableRows.find(
        (r) => r.stationShortCode === stationCode
      );
      const bRow = b.timeTableRows.find(
        (r) => r.stationShortCode === stationCode
      );
      return (
        new Date(aRow?.scheduledTime || 0) - new Date(bRow?.scheduledTime || 0)
      );
    });

    console.log("Filtered and sorted trains:", stationName); // to see filtered

    const upcomingContainer = document.createElement("div");
    pastTrainsDiv.innerHTML = "";

    // Loop through filtered trains to create a card for each one.
    filtered.forEach((train) => {
      const arr = train.timeTableRows.find(
        (r) => r.stationShortCode === stationCode && r.type === "ARRIVAL"
      );
      const dep = train.timeTableRows.find(
        (r) => r.stationShortCode === stationCode && r.type === "DEPARTURE"
      );

      // Extract and format arrival/departure times.
      const arrTime = arr ? new Date(arr.scheduledTime) : null;
      const depTime = dep ? new Date(dep.scheduledTime) : null;
      const reference = depTime || arrTime;
      const isPast = reference && reference < now;

      const arrStr = arrTime
        ? arrTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "—";
      const depStr = depTime
        ? depTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "—";

      // Calculate delay (if any)
      const delay = dep?.differenceInMinutes || arr?.differenceInMinutes || 0;
      const delayClass = delay > 0 ? "delayed" : "on-time";
      const delayText = delay > 0 ? `Delayed ${delay} min` : "On time";

      // Find train’s final destination
      const destCode = train.timeTableRows.at(-1).stationShortCode;
      const destStation = stations.find(
        (st) => st.stationShortCode === destCode
      );
      const destinationName = destStation ? destStation.stationName : destCode;

      // Generate display name for the train (e.g., "IC 45" or "HSL A").
      const trainName =
        train.commuterLineID || `${train.trainType} ${train.trainNumber}`;
      console.log("Creating card for train:", trainName); // to see each train card

      // Create visual card element
      const card = document.createElement("div");
      card.classList.add("train-card");
      if (isPast) card.classList.add("past-train");

      // Fill the card with train details
      card.innerHTML = `
        <div><strong>Train:</strong> ${trainName}${
        isPast ? " (Past)" : ""
      }</div>
        <div>
          <strong>Destination:</strong>
          <a class="destination-link"
             href="https://www.google.com/maps/search/${encodeURIComponent(
               destinationName
             )}"
             target="_blank">${destinationName}</a><br>
          <strong>Arrival:</strong> ${arrStr}<br>
          <strong>Departure:</strong> ${depStr}<br>
          <strong>Status:</strong> <span class="${delayClass}">${delayText}</span>
        </div>
      `;
      console.log("Upcoming trains displayed for:", destinationName); // to see upcoming trains destinationName
      // Place in correct section (upcoming or past)
      if (isPast) pastTrainsDiv.appendChild(card);
      else upcomingContainer.appendChild(card);
    });

    // Add all upcoming trains to main result area.
    resultsDiv.appendChild(upcomingContainer);

    // Show or hide the "past trains" section depending on content.
    const hasPast = pastTrainsDiv.children.length > 0;
    pastSection.classList.toggle("hidden", !hasPast);
    togglePastBtn.textContent = "Show Past Trains";
    pastTrainsDiv.classList.add("hidden");
  } catch (err) {
    // If the API request fails, hide loading and show an error message.
    loading.classList.add("hidden");
    showError(`❌ Error fetching data: ${err.message}`);
  }
}

// ================================
//  HELPER FUNCTIONS
// ================================

// Displays an error message in the sidebar.
function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.remove("hidden");
}

// Updates the live clock text in the sidebar.
function updateClock() {
  const now = new Date();

  currentTimeDisplay.textContent = `Current Time: ${now.toLocaleTimeString(
    "en-GB",
    {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  )}`;
}

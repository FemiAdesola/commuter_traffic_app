// ===============================================
// jQuery-converted version of the provided app.js
// FULLY COMMENTED VERSION
// ===============================================

$(document).ready(async function () {
  // -----------------------------------------------
  // CACHE UI ELEMENTS (for efficiency & readability)
  // -----------------------------------------------
  const $stationInput = $("#stationInput");
  const $searchBtn = $("#searchBtn");
  const $resultsDiv = $("#results");
  const $loading = $("#loading");
  const $errorDiv = $("#error");
  const $currentTimeDisplay = $("#currentTime");
  const $timeRangeDisplay = $("#timeRange");
  const $togglePastBtn = $("#togglePastBtn");
  const $pastSection = $("#past-section");
  const $pastTrainsDiv = $("#pastTrains");

  // Custom dropdown elements
  const $customSelect = $("#customSelect");
  const $selected = $customSelect.find(".selected");
  const $optionsContainer = $("#stationOptions");

  // Theme toggle button
  const $themeToggleBtn = $("#themeToggleBtn");

  // -----------------------------------------------
  // APPLICATION STATE
  // -----------------------------------------------
  let stations = [];        // Loaded station metadata
  let refreshInterval;      // Interval for auto-refreshing train data
  let showAllPast = false;  // Toggle for showing past trains

  // -----------------------------------------------
  // THEME LOADING: Check saved theme in localStorage
  // -----------------------------------------------
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    $("body").addClass("light-theme");
    $themeToggleBtn.text("☀️");
  } else {
    // Default theme is dark
    $themeToggleBtn.text("🌙");
  }

  // Toggle between light/dark mode
  $themeToggleBtn.on("click", function () {
    $("body").toggleClass("light-theme");

    const isLight = $("body").hasClass("light-theme");
    $themeToggleBtn.text(isLight ? "☀️" : "🌙");

    // Save preference
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });

  // -----------------------------------------------
  // CLOCK: Display the live time (updates every sec)
  // -----------------------------------------------
  function updateClock() {
    const now = new Date();
    $currentTimeDisplay.text(
      `Current Time: ${now.toLocaleTimeString("en-GB", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`
    );
  }

  updateClock();
  setInterval(updateClock, 1000);

  // -----------------------------------------------
  // LOAD STATION METADATA FROM DIGITRAFFIC
  // -----------------------------------------------
  try {
    const response = await fetch(
      "https://rata.digitraffic.fi/api/v1/metadata/stations"
    );
    stations = await response.json();

    // Populate the custom dropdown list
    populateStationSelect(stations);
  } catch {
    showError("❌ Failed to load station data.");
  }

  // -----------------------------------------------
  // POPULATE CUSTOM DROPDOWN WITH STATION NAMES
  // -----------------------------------------------
  function populateStationSelect(stations) {
    $optionsContainer.empty();

    stations.forEach((st) => {
      const $opt = $(
        `<div class="option" data-code="${st.stationShortCode}">
           ${st.stationName}
         </div>`
      );

      // When user clicks a station name:
      $opt.on("click", function () {
        $selected.text(st.stationName);   // Display name on dropdown
        $stationInput.val(st.stationName); // Insert into text input
        $optionsContainer.addClass("hidden");
      });

      $optionsContainer.append($opt);
    });
  }

  // -----------------------------------------------
  // CUSTOM SELECT: OPEN/CLOSE ON CLICK
  // -----------------------------------------------
  $customSelect.on("click", function (e) {
    if ($(e.target).hasClass("selected")) {
      $optionsContainer.toggleClass("hidden");
    }
  });

  // Close dropdown when clicking outside
  $(document).on("click", function (e) {
    if (!$.contains($customSelect[0], e.target)) {
      $optionsContainer.addClass("hidden");
    }
  });

  // -----------------------------------------------
  // SEARCH FIELD: DYNAMIC FILTERING OF DROPDOWN
  // -----------------------------------------------
  $stationInput.on("input", function () {
    const query = $stationInput.val().trim().toLowerCase();
    const $options = $optionsContainer.find(".option");

    // No input → reset interface
    if (!query) {
      $options.show();
      $selected.text("-- Select a station --");
      $optionsContainer.addClass("hidden");
      $resultsDiv.empty();
      $timeRangeDisplay.text("");
      $pastSection.addClass("hidden");
      $errorDiv.addClass("hidden");
      return;
    }

    // Filter dropdown options based on text match
    let anyMatch = false;

    $options.each(function () {
      const match = $(this).text().toLowerCase().includes(query);
      $(this).toggle(match);
      if (match) anyMatch = true;
    });

    if (anyMatch) $optionsContainer.removeClass("hidden");
    else $optionsContainer.addClass("hidden");

    // Auto-set dropdown selection if exact/partial match exists
    const found = stations.find(
      (st) =>
        st.stationName.toLowerCase() === query ||
        st.stationName.toLowerCase().startsWith(query)
    );

    $selected.text(found ? found.stationName : "-- Select a station --");
  });

  // -----------------------------------------------
  // CLICK-EVENT: SEARCH BUTTON
  // -----------------------------------------------
  $searchBtn.on("click", handleSearch);

  // Pressing Enter runs search
  $stationInput.on("keypress", function (e) {
    if (e.key === "Enter") handleSearch();
  });

  // -----------------------------------------------
  // TOGGLE SHOW/HIDE PAST TRAINS SECTION
  // -----------------------------------------------
  $togglePastBtn.on("click", function () {
    showAllPast = !showAllPast;

    $pastTrainsDiv.toggleClass("hidden", !showAllPast);
    $togglePastBtn.text(showAllPast ? "Hide Past Trains" : "Show Past Trains");
  });

  // -----------------------------------------------
  // MAIN SEARCH HANDLER
  // -----------------------------------------------
  async function handleSearch() {
    clearInterval(refreshInterval);
    $errorDiv.addClass("hidden");

    const query = $stationInput.val().trim().toLowerCase();
    const selectedStation = $selected.text().trim();

    // No input + no selected station
    if (!query && selectedStation === "-- Select a station --") {
      showError("⚠️ Please enter or choose a station.");
      return;
    }

    // Try to match the input to a station
    const found = stations.find((st) => {
      const name = st.stationName.toLowerCase();
      return (
        name === query ||
        name.startsWith(query) ||
        name === selectedStation.toLowerCase()
      );
    });

    if (!found) {
      showError("❌ Station not found.");
      return;
    }

    // Load train data immediately
    await fetchTrainData(found.stationShortCode, found.stationName);

    // Auto-refresh the station every 45 seconds
    refreshInterval = setInterval(
      () => fetchTrainData(found.stationShortCode, found.stationName),
      45000
    );

    $optionsContainer.addClass("hidden");
  }

  // -----------------------------------------------
  // FETCH LIVE TRAIN DATA FOR A STATION
  // -----------------------------------------------
  async function fetchTrainData(stationCode, stationName) {
    // Reset UI for loading
    $resultsDiv.empty();
    $loading.removeClass("hidden");
    $errorDiv.addClass("hidden");

    try {
      // Fetch live train list for station
      const response = await fetch(
        `https://rata.digitraffic.fi/api/v1/live-trains/station/${stationCode}?arriving_trains=20&departing_trains=20&include_nonstopping=false`
      );
      const trains = await response.json();

      $loading.addClass("hidden");

      const now = new Date();

      // Show trains in a ±2 hour window around current time
      const startTime = new Date(now.getTime() - 2 * 3600000);
      const endTime = new Date(now.getTime() + 2 * 3600000);

      // Display time window
      $timeRangeDisplay.text(
        `Showing trains from: ${startTime.toLocaleTimeString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} – ${endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );

      // Filter trains that pass the station in this time window
      const filtered = trains.filter((train) =>
        train.timeTableRows.some(
          (row) =>
            row.stationShortCode === stationCode &&
            new Date(row.scheduledTime) >= startTime &&
            new Date(row.scheduledTime) <= endTime
        )
      );

      if (!filtered.length) {
        $resultsDiv.html(
          `<p>No trains found for ${stationName} in this time window.</p>`
        );
        return;
      }

      // Header
      $resultsDiv.html(
        `<h2>Live Arrivals & Departures for ${stationName} station</h2>`
      );

      // Sort trains by nearest arrival/departure time
      filtered.sort((a, b) => {
        const aRow = a.timeTableRows.find(
          (r) => r.stationShortCode === stationCode
        );
        const bRow = b.timeTableRows.find(
          (r) => r.stationShortCode === stationCode
        );
        return (
          new Date(aRow?.scheduledTime || 0) -
          new Date(bRow?.scheduledTime || 0)
        );
      });

      const $upcomingContainer = $("<div></div>");
      $pastTrainsDiv.empty();

      // -----------------------------------------------
      // RENDER EACH TRAIN AS A CARD
      // -----------------------------------------------
      filtered.forEach((train) => {
        const arr = train.timeTableRows.find(
          (r) =>
            r.stationShortCode === stationCode && r.type === "ARRIVAL"
        );
        const dep = train.timeTableRows.find(
          (r) =>
            r.stationShortCode === stationCode && r.type === "DEPARTURE"
        );

        const arrTime = arr ? new Date(arr.scheduledTime) : null;
        const depTime = dep ? new Date(dep.scheduledTime) : null;

        const reference = depTime || arrTime;
        const isPast = reference && reference < now;

        const arrStr = arrTime
          ? arrTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";

        const depStr = depTime
          ? depTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";

        // Delay calculation
        const delay = dep?.differenceInMinutes || arr?.differenceInMinutes || 0;
        const delayClass = delay > 0 ? "delayed" : "on-time";
        const delayText =
          delay > 0 ? `Delayed ${delay} min` : "On time";

        // Destination is last timetable row
        const destCode = train.timeTableRows.at(-1).stationShortCode;
        const destStation = stations.find(
          (st) => st.stationShortCode === destCode
        );
        const destinationName = destStation
          ? destStation.stationName
          : destCode;

        // Train identifier: commuter ID or TrainType + number
        const trainName =
          train.commuterLineID ||
          `${train.trainType} ${train.trainNumber}`;

        // Build card HTML
        const $card = $(`
          <div class="train-card ${isPast ? "past-train" : ""}">
            <div><strong>Train:</strong> ${trainName} ${
          isPast ? "(Past)" : ""
        }</div>
            <div>
              <strong>Destination:</strong>
              <a class="destination-link"
                 href="https://www.google.com/maps/search/${encodeURIComponent(
                   destinationName
                 )}"
                 target="_blank">
                 ${destinationName}
              </a><br>

              <strong>Arrival:</strong> ${arrStr}<br>
              <strong>Departure:</strong> ${depStr}<br>

              <strong>Status:</strong>
              <span class="${delayClass}">${delayText}</span>
            </div>
          </div>
        `);

        // Push card into correct section
        if (isPast) $pastTrainsDiv.append($card);
        else $upcomingContainer.append($card);
      });

      // Show upcoming trains
      $resultsDiv.append($upcomingContainer);

      // Show/hide past section depending on whether we have any past items
      const hasPast = $pastTrainsDiv.children().length > 0;

      $pastSection.toggleClass("hidden", !hasPast);
      $togglePastBtn.text("Show Past Trains");
      $pastTrainsDiv.addClass("hidden");
    } catch (err) {
      $loading.addClass("hidden");
      showError(`❌ Error fetching data: ${err.message}`);
    }
  }

  // -----------------------------------------------
  // SHOW ERROR MESSAGES
  // -----------------------------------------------
  function showError(msg) {
    $errorDiv.text(msg).removeClass("hidden");
  }
});

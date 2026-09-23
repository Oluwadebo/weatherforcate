const statusLine = document.getElementById("statusLine");
const statsRow = document.getElementById("statsRow");
const checkBtn = document.getElementById("checkBtn");
const cityInput = document.getElementById("city");
const weatherIcon = document.getElementById("weatherIcon");
const forecastSection = document.getElementById("forecastSection");
const forecastStrip = document.getElementById("forecastStrip");
const recentWrap = document.getElementById("recentWrap");
const recentChips = document.getElementById("recentChips");

// Requests go through /api/weather and /api/forecast (Vercel serverless
// functions, see the /api folder) instead of calling OpenWeatherMap
// directly. The real API key lives only in Vercel's environment variables
// (OPENWEATHER_API_KEY) and never reaches the browser.
const RECENT_KEY = "weatherRecentCities";

function setState(state, message) {
  // state: 'idle' | 'loading' | 'error' | 'done'
  statusLine.textContent = message || "\u00A0";
  statusLine.classList.toggle("is-error", state === "error");
  statsRow.classList.toggle("is-loading", state === "loading");
  checkBtn.disabled = state === "loading";
  checkBtn.innerHTML =
    state === "loading" ? '<span class="spinner"></span>Checking' : "CHECK WEATHER";
}

function renderWeather(data) {
  weather.innerHTML = `${Math.round(data.main.temp - 273)} <sup>0</sup><sub>C</sub>`;
  feelsLike.innerHTML = `${Math.round(data.main.feels_like - 273)} <sup>0</sup><sub>C</sub>`;
  country.innerHTML = data.sys.country;
  named.innerHTML = data.name;
  dep.innerHTML = data.weather[0].description;
  hum.innerHTML = data.main.humidity;
  win.innerHTML = data.wind.speed;

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  weatherIcon.alt = data.weather[0].description;
  weatherIcon.style.display = "inline-block";
}

function renderForecast(forecastData) {
  forecastStrip.innerHTML = "";
  const dailyMap = {};
  forecastData.list.forEach((entry) => {
    const [datePart, timePart] = entry.dt_txt.split(" ");
    // prefer the entry closest to midday for each date
    if (!dailyMap[datePart] || timePart === "12:00:00") {
      dailyMap[datePart] = entry;
    }
  });

  const days = Object.values(dailyMap).slice(0, 5);
  days.forEach((entry) => {
    const date = new Date(entry.dt_txt.replace(" ", "T"));
    const dayLabel = date.toLocaleDateString(undefined, { weekday: "short" });
    const temp = Math.round(entry.main.temp - 273);
    const icon = entry.weather[0].icon;
    const desc = entry.weather[0].description;

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="forecast-day">${dayLabel}</div>
      <img class="forecast-icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" />
      <div class="forecast-temp">${temp}&deg;</div>
    `;
    forecastStrip.appendChild(card);
  });

  forecastSection.style.display = days.length ? "block" : "none";
}

// Reads the fetch response, distinguishing bad API key (401),
// city not found (404), and any other server-side failure.
async function processWeatherResponse(response, label) {
  if (response.status === 401) {
    setState("error", "Weather service authorization failed (invalid API key).");
    return null;
  }
  if (response.status === 404) {
    setState("error", `No reading found for "${label}".`);
    return null;
  }
  if (!response.ok) {
    setState("error", "Weather service returned an unexpected error.");
    return null;
  }
  return await response.json();
}

async function fetchWeatherByCity(cityName) {
  const weatherUrl = `/api/weather?q=${encodeURIComponent(cityName)}`;
  const response = await fetch(weatherUrl);
  const data = await processWeatherResponse(response, cityName);
  if (!data) return;

  renderWeather(data);
  setState("done", "\u00A0");
  addRecentCity(data.name);

  try {
    const forecastUrl = `/api/forecast?q=${encodeURIComponent(cityName)}`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await processWeatherResponse(forecastRes, cityName);
    if (forecastData) renderForecast(forecastData);
  } catch (e) {
    // forecast is a bonus, fail quietly rather than blocking the main reading
  }
}

async function fetchWeatherByCoords(lat, lon) {
  const weatherUrl = `/api/weather?lat=${lat}&lon=${lon}`;
  const response = await fetch(weatherUrl);
  const data = await processWeatherResponse(response, "your location");
  if (!data) return;

  renderWeather(data);
  setState("done", "\u00A0");
  addRecentCity(data.name);

  try {
    const forecastUrl = `/api/forecast?lat=${lat}&lon=${lon}`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await processWeatherResponse(forecastRes, "your location");
    if (forecastData) renderForecast(forecastData);
  } catch (e) {
    // forecast is a bonus, fail quietly
  }
}

function getRecentCities() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function addRecentCity(name) {
  let recents = getRecentCities().filter((c) => c.toLowerCase() !== name.toLowerCase());
  recents.unshift(name);
  recents = recents.slice(0, 5);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
  } catch (e) {
    // localStorage unavailable (private browsing, etc.) — skip silently
  }
  renderRecentCities();
}

function renderRecentCities() {
  const recents = getRecentCities();
  recentChips.innerHTML = "";
  if (recents.length === 0) {
    recentWrap.style.display = "none";
    return;
  }
  recentWrap.style.display = "flex";
  recents.forEach((name) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "recent-chip";
    chip.textContent = name;
    chip.onclick = () => {
      cityInput.value = name;
      generat();
    };
    recentChips.appendChild(chip);
  });
}

// Runs on page load. Tries the browser's geolocation first,
// falls back to the default city if it's denied/unavailable.
function getLocation() {
  if (!navigator.geolocation) {
    setState("loading", "Fetching weather for Ogbomoso…");
    fetchWeatherByCity("ogbomoso").catch(() =>
      setState("error", "Could not reach the weather service. Check your connection.")
    );
    return;
  }

  setState("loading", "Getting your location…");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      setState("loading", "Fetching weather for your location…");
      try {
        await fetchWeatherByCoords(latitude, longitude);
      } catch (err) {
        setState("error", "Could not reach the weather service. Check your connection.");
      }
    },
    async () => {
      // permission denied, timed out, or unavailable — fall back to default city
      setState("loading", "Fetching weather for Ogbomoso…");
      try {
        await fetchWeatherByCity("ogbomoso");
      } catch (err) {
        setState("error", "Could not reach the weather service. Check your connection.");
      }
    },
    { timeout: 8000 }
  );
}

async function generat() {
  let userLocation = cityInput.value;
  if (!userLocation.trim()) {
    setState("error", "Enter a city first.");
    return;
  }
  setState("loading", `Fetching weather for ${userLocation}…`);
  try {
    await fetchWeatherByCity(userLocation);
  } catch (err) {
    setState("error", "Could not reach the weather service. Check your connection.");
  }
}

function initPage() {
  renderRecentCities();
  getLocation();
}

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") generat();
});

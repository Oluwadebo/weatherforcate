# Anthony Weather Forecast

A weather lookup app built on Bootstrap 5, using the [OpenWeatherMap](https://openweathermap.org/api) API. Shows current conditions for your device's location on load, or any city you search for, plus a 5-day outlook.

## Files

```
weather-app/
├── index.html   → page structure/markup
├── style.css    → all custom styling (Bootstrap is loaded from CDN, this file overrides/extends it)
├── app.js       → all app logic: fetching weather, rendering results, geolocation, recent searches
└── pic/         → background photo(s) — add your own image(s) here, see "Background image" below
```

## Setup

1. Keep all four files (`index.html`, `style.css`, `app.js`, and the `pic/` folder) in the same directory — `index.html` links to the other two by relative path (`style.css`, `app.js`), so don't rename or move them without updating those links.
2. Add a `pic/` folder next to `index.html` containing an image named `wolfgang-hasselmann-bR_-gllg7Bs-unsplash.jpg` (or update the path in `style.css` under `.bg-photo` to match whatever image you use).
3. Open `index.html` directly in a browser, or serve it locally (e.g. VS Code's "Live Server" extension) for the most reliable experience — see the Geolocation note below.

## Features

- **Current location on load** — asks for browser location permission on page load (`navigator.geolocation`); falls back to a default city (Ogbomoso) if denied, unavailable, or on browsers without geolocation support.
- **City search** — type a city and press Enter or click "Check Weather".
- **Feels-like temperature + weather icon** — pulled from the same API response, no extra request needed.
- **5-day outlook strip** — a second API call to OpenWeatherMap's forecast endpoint, showing one reading per day (picked from the entry closest to midday).
- **Recent searches** — the last 5 cities you've looked up are saved in the browser's `localStorage` and shown as clickable chips.
- **Loading and error states** — the "Check Weather" button shows a spinner while fetching; distinct error messages for city-not-found (404), invalid API key (401), and connection failures.
- **Responsive layout** — Bootstrap's grid stacks to a single column on mobile; stat dividers switch from vertical to horizontal below 768px width.

## Known limitations / things to know

- **API key is visible in `app.js`.** This is fine for local/personal use, but if you ever deploy this publicly with real traffic, anyone can view your page's JS source and see the key. To fix that properly, you'd route the fetch calls through a small backend or serverless function that holds the key server-side instead.
- **OpenWeatherMap free tier** allows 60 calls/minute. Each search now fires 2 requests (current weather + forecast), so heavy testing will hit that limit roughly twice as fast as before.
- **Geolocation requires HTTPS or `localhost`.** Opening the file directly (`file://`) may still prompt for permission in some browsers, but for reliable behavior, especially once you're ready to put this somewhere real, serve it over `https://`.
- The background photo path in `style.css` is a relative link (`pic/...`) — it will show as a broken image until you add a matching file to the `pic/` folder.

## Customizing

- **Colors/fonts**: all defined as CSS variables at the top of `style.css` (`--navy`, `--amber`, `--paper`, etc.) — change them there rather than hunting through individual rules.
- **Default city**: search `"ogbomoso"` in `app.js` (in `getLocation()`) and replace it with your preferred fallback city.
- **Number of recent searches shown**: change `.slice(0, 5)` in the `addRecentCity()` function in `app.js`.
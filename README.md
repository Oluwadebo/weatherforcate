# Anthony Weather Forecast

A weather lookup app built on Bootstrap 5, using the [OpenWeatherMap](https://openweathermap.org/api) API. Shows current conditions for your device's location on load, or any city you search for, plus a 5-day outlook.

## Files

```
weather-app/
├── index.html        → page structure/markup
├── style.css         → all custom styling (Bootstrap is loaded from CDN, this file overrides/extends it)
├── app.js            → all app logic: fetching weather, rendering results, geolocation, recent searches
├── api/
│   ├── weather.js    → Vercel serverless function, proxies current-weather requests
│   └── forecast.js   → Vercel serverless function, proxies 5-day-forecast requests
└── pic/               → background photo(s) — add your own image(s) here, see "Background image" below
```

The browser never holds an API key. `app.js` calls your own `/api/weather` and `/api/forecast` endpoints; those serverless functions attach the real OpenWeatherMap key (read from an environment variable) and forward the request. Anyone viewing your page's source only sees calls to your own domain, never the key.

## Local setup (no deployment yet)

Because `/api` routes are serverless functions, plain "open `index.html` in a browser" or a static file server (e.g. Live Server) **won't** run them — you'll get 404s on `/api/weather`. To test locally with the API routes working:

1. Install the Vercel CLI: `npm install -g vercel`
2. In the project folder, run `vercel dev`
3. It'll ask you to link/create a Vercel project the first time, then serve the site (including `/api`) at a local URL like `http://localhost:3000`.
4. Set your API key locally by creating a `.env` file (see below) — `vercel dev` reads it automatically.

**`.env`** (create this file, keep it out of git — add `.env` to `.gitignore`):
```
OPENWEATHER_API_KEY=your-real-key-here
```

## Deploying to Vercel (production)

1. Push this project to GitHub (see your earlier commit/push steps).
2. Go to [vercel.com](https://vercel.com), "Add New Project", and import the GitHub repo.
3. Before or after the first deploy, go to **Project Settings → Environment Variables** and add:
   - Key: `OPENWEATHER_API_KEY`
   - Value: your real OpenWeatherMap key
   - Environment: Production (and Preview/Development if you want those to work too)
4. Redeploy if you added the variable after the first deploy (Vercel needs a fresh build to pick it up).
5. Your live site will call `/api/weather` and `/api/forecast` on its own domain — the key stays server-side.

## Features

- **Current location on load** — asks for browser location permission on page load (`navigator.geolocation`); falls back to a default city (Ogbomoso) if denied, unavailable, or on browsers without geolocation support.
- **City search** — type a city and press Enter or click "Check Weather".
- **Feels-like temperature + weather icon** — pulled from the same API response, no extra request needed.
- **5-day outlook strip** — a second API call to OpenWeatherMap's forecast endpoint, showing one reading per day (picked from the entry closest to midday).
- **Recent searches** — the last 5 cities you've looked up are saved in the browser's `localStorage` and shown as clickable chips.
- **Loading and error states** — the "Check Weather" button shows a spinner while fetching; distinct error messages for city-not-found (404), invalid API key (401), and connection failures.
- **Responsive layout** — Bootstrap's grid stacks to a single column on mobile; stat dividers switch from vertical to horizontal below 768px width.

## Known limitations / things to know

- **`/api` routes only work under Vercel (or `vercel dev` locally).** Opening `index.html` directly, or serving it with a plain static server, will 404 on weather/forecast requests. See "Local setup" above.
- **OpenWeatherMap free tier** allows 60 calls/minute. Each search fires 2 requests (current weather + forecast) to your own `/api` routes, which each make 1 call to OpenWeatherMap — so 2 OpenWeatherMap calls per search.
- **Geolocation requires HTTPS or `localhost`.** Vercel serves everything over HTTPS by default, so this works out of the box once deployed; for local testing, `vercel dev`'s `localhost` also satisfies this.
- The background photo path in `style.css` is a relative link (`pic/...`) — it will show as a broken image until you add a matching file to the `pic/` folder.
- Never commit a real API key anywhere in this repo (including a `.env` file) — set it only in Vercel's Environment Variables dashboard and, for local dev, in a gitignored `.env` file.

## Customizing

- **Colors/fonts**: all defined as CSS variables at the top of `style.css` (`--navy`, `--amber`, `--paper`, etc.) — change them there rather than hunting through individual rules.
- **Default city**: search `"ogbomoso"` in `app.js` (in `getLocation()`) and replace it with your preferred fallback city.
- **Number of recent searches shown**: change `.slice(0, 5)` in the `addRecentCity()` function in `app.js`.

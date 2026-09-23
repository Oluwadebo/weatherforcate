export default async function handler(req, res) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server missing OPENWEATHER_API_KEY." });
  }

  const { q, lat, lon } = req.query;
  let url;
  if (q) {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(q)}&appid=${apiKey}`;
  } else if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  } else {
    return res.status(400).json({ error: "Provide either ?q=cityname or ?lat=&lon=" });
  }

  const response = await fetch(url);
  const data = await response.json();
  res.status(response.status).json(data);
}

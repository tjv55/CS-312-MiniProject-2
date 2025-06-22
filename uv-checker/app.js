const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// App setup
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Default coordinates: Los Angeles
const defaultLat = 34.053939;
const defaultLng = -118.244514;

const OPENUV_API_KEY = 'openuv-26rrmc8asfob-io';


// Function to generate sunscreen recommendation
function getRecommendation(uv) {
  if (uv < 3) return "🟢 Low UV: No protection needed.";
  if (uv < 6) return "🟡 Moderate UV: Sunscreen recommended.";
  if (uv < 8) return "🟠 High UV: Sunscreen and protective clothing recommended.";
  return "🔴 Very High UV: Avoid sun exposure during midday hours.";
}


// Routes
app.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.openuv.io/api/v1/uv', {
      headers: { 'x-access-token': OPENUV_API_KEY },
      params: {
        lat: defaultLat,
        lng: defaultLng
      }
    });

    const uv = response.data.result.uv.toFixed(1);
    const recommendation = getRecommendation(uv);

    res.render('home', {
      uv,
      recommendation,
      lat: defaultLat,
      lng: defaultLng
    });

  } catch (error) {
    console.error("Default UV fetch failed:", error.response?.data || error.message);
    res.render('home', {
      uv: null,
      recommendation: "Could not load LA UV data. Try entering your own coordinates.",
      lat: '',
      lng: ''
    });
  }
});

// Handle user-submitted coordinates
app.post('/', async (req, res) => {
  const lat = parseFloat(req.body.lat);
  const lng = parseFloat(req.body.lng);

  try {
    const response = await axios.get('https://api.openuv.io/api/v1/uv', {
      headers: { 'x-access-token': OPENUV_API_KEY },
      params: { lat, lng }
    });

    const uv = response.data.result.uv.toFixed(1);
    const recommendation = getRecommendation(uv);

    res.render('home', {
      uv,
      recommendation,
      lat,
      lng
    });

  } catch (error) {
    console.error("User UV fetch failed:", error.response?.data || error.message);
    res.render('home', {
      uv: null,
      recommendation: "Something went wrong. Please check your location and try again.",
      lat,
      lng
    });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const app = express();
const PORT = process.env.PORT || 3000;

const OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf62483e7499e92f944a0ca067ac77c4746e49'; // Replace with your actual API key
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZnJlZWZyZWU2MCIsImEiOiJjbHdyZ2hlamwwMGczMmlzYXJiem9oaHFxIn0.bp_4Do2mZmVjZwkDxlWmfw'; // Replace with your actual API key

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Path Drawing API');
});

app.post('/path', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).send('Origin and destination are required');
  }

  try {
    // Fetch directions from OpenRouteService API
    const directionsResponse = await axios.post('https://api.openrouteservice.org/v2/directions/driving-car', {
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat]
      ]
    }, {
      headers: {
        'Authorization': OPENROUTESERVICE_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const route = directionsResponse.data.routes[0].geometry;

    // Create a map with the route using Mapbox Static API
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/path-5+ff0000(${route})/auto/600x400?access_token=${MAPBOX_ACCESS_TOKEN}`;

    const mapResponse = await axios.get(mapUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(mapResponse.data, 'binary');

    // Process the image using sharp (optional, for example purposes)
    const processedImageBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();

    // Send the response with the route and the image
    res.json({
      route,
      image: `data:image/png;base64,${processedImageBuffer.toString('base64')}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching directions or processing image');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

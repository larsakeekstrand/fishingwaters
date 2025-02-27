import express from 'express';
import path from 'path';
import { loadLakeData } from './services/lakeService';

const app = express();
const port = process.env.PORT || 3000;

let geoJsonData;

try {
  geoJsonData = loadLakeData();
} catch (error) {
  console.error('Error loading lake data:', error);
  geoJsonData = null;
}

app.use(express.static(path.join(__dirname, '../public')));

// API endpoint to serve lake data as GeoJSON
app.get('/api/lakes', (req, res) => {
  try {
    res.json(geoJsonData);
  } catch (error) {
    console.error('Error loading lake data:', error);
    res.status(500).json({ error: 'Failed to load lake data' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;

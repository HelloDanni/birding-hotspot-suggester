// === backend/index.js ===
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fetch } from 'undici';
import { parse } from 'csv-parse/sync';


dotenv.config()
const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

const EBIRD_API_KEY = process.env.EBIRD_API_KEY;

app.get('/api/counties/:stateCode', async (req, res) => {
    const { stateCode } = req.params;
    const apiKey = process.env.EBIRD_API_KEY;
  
    try {
      const response = await fetch(`https://api.ebird.org/v2/ref/region/list/subnational2/US-${stateCode}`, {
        headers: {
          'X-eBirdApiToken': apiKey
        }
      });
  
      if (!response.ok) {
        throw new Error(`eBird API error: ${response.statusText}`);
      }
  
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching counties:', error);
      res.status(500).json({ error: 'Failed to fetch counties' });
    }
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  app.get('/api/hotspot/region', async (req, res) => {
    const { regionCode } = req.query;
    const EBIRD_API_KEY = process.env.EBIRD_API_KEY;
  
    if (!regionCode) return res.status(400).json({ error: 'Missing regionCode' });
  
    const url = `https://api.ebird.org/v2/ref/hotspot/region/${regionCode}`;
  
    try {
      const response = await fetch(url, {
        headers: {
          'X-eBirdApiToken': EBIRD_API_KEY,
          'Accept': 'text/csv'
        }
      });
  
      if (!response.ok) {
        console.error(`eBird returned status ${response.status}`);
        return res.status(response.status).json({ error: `eBird API returned ${response.status}` });
      }
  
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("text/csv")) {
        const html = await response.text();
        console.error("Received HTML instead of CSV:", html.slice(0, 200));
        return res.status(502).json({ error: "eBird returned unexpected content" });
      }
  
      const csv = await response.text();
  
      const records = parse(csv, {
        columns: ['locId', 'countryCode', 'subnational1Code', 'subnational2Code', 'lat', 'lng', 'locName', 'latestObsDt', 'numSpeciesAllTime'],
        skip_empty_lines: true,
        relax_column_count: true
      });
  
      if (records.length === 0) return res.status(404).json({ error: 'No hotspots found' });
  
      const randomHotspot = records[Math.floor(Math.random() * records.length)];
      res.json(randomHotspot);
    } catch (error) {
      console.error("Region fetch failed:", error);
      res.status(500).json({ error: 'Failed to fetch regional hotspots', details: error.message });
    }
  });
  
  
  

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
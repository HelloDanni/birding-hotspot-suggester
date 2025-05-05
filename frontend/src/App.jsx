// === frontend/src/App.jsx ===
import { useState, useEffect } from 'react';
import axios from 'axios';
import { US_STATES } from './states';

export default function App() {
  const [hotspot, setHotspot] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [counties, setCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState('');

  useEffect(() => {
    const fetchCounties = async () => {
      if (!selectedState) return;

      const apiKey = import.meta.env.VITE_EBIRD_API_KEY;
      console.log("Using API key:", apiKey);
      console.log("Selected state:", selectedState);

      try {
        const response = await axios.get(`http://localhost:5000/api/counties/${selectedState}`);
        setCounties(response.data);
      } catch (error) {
        console.error("Failed to fetch counties:", error);
      }
    };
    fetchCounties();
  }, [selectedState]);

  const fetchHotspotByCounty = async () => {
    if (!selectedCounty) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/hotspot/region?regionCode=${selectedCounty}`);
      setHotspot(res.data);
    } catch (err) {
      console.error('Error fetching hotspot', err);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-white text-black flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Random Birding Hotspot Suggester</h1>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Select State:</label>
        <select
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300 bg-white text-black"
        >
          <option value="">-- Select a State --</option>
          {US_STATES.map(state => (
            <option key={state.code} value={state.code}>{state.name}</option>
          ))}
        </select>
      </div>

      {counties.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Select County:</label>
          <select
            value={selectedCounty}
            onChange={e => setSelectedCounty(e.target.value)}
            className="px-4 py-2 rounded border border-gray-300 bg-white text-black"
          >
            <option value="">-- Select a County --</option>
            {counties.map(county => (
              <option key={county.code} value={county.code}>{county.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedCounty && (
        <button onClick={fetchHotspotByCounty} className="bg-blue-600 text-white px-4 py-2 rounded shadow">
          Suggest a Spot
        </button>
      )}

      {hotspot && (
        <div className="mt-6 p-4 bg-white text-black rounded shadow w-full max-w-md">
          <h2 className="text-xl font-semibold text-black">{hotspot.locName}</h2>
          <p className="text-sm">Coordinates: {hotspot.lat}, {hotspot.lng}</p>
          <a
            className="text-blue-500 underline mt-2 block"
            href={`https://www.google.com/maps?q=${hotspot.lat},${hotspot.lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

// mapHelper.js

const MAPBOX_SECRET_API = 'https://vai.dev.sms.visionariesai.com/api/secrets/';

export const fetchMapboxToken = async () => {
  try {
    const res = await fetch(MAPBOX_SECRET_API);
    const data = await res.json();
    const token = data.results.find(item => item.name === 'MAPBOX_TOKEN')?.value;

    if (!token) {
      throw new Error('MAPBOX_TOKEN not found in response');
    }

    return token;
  } catch (err) {
    console.error('Failed to fetch Mapbox token:', err.message);
    throw err;
  }
};

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/logos', express.static(path.join(__dirname, 'logos')));

// Landing page at root
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'landing.html')));

// Proxy: get aircraft near location
app.get('/api/aircraft', async (req, res) => {
    const { lat, lon, radius } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
    try {
        const r = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${radius || 25}`);
        const data = await r.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Proxy: get route info
app.post('/api/routeset', async (req, res) => {
    try {
        const r = await fetch('https://api.adsb.lol/api/0/routeset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await r.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Proxy: track specific flight by callsign
app.get('/api/flight/:callsign', async (req, res) => {
    try {
        const r = await fetch(`https://api.adsb.lol/v2/callsign/${req.params.callsign}`);
        const data = await r.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✈ It's a Plane dashboard running at http://localhost:${PORT}`));

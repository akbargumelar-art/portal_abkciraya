// Note: This is a Node.js Express server. The platform running this code
// needs to support Node.js execution and install dependencies (e.g., express, body-parser).
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
// The execution environment will likely provide the port.
const PORT = process.env.PORT || 3001; 

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// --- API Routes ---

app.post('/api/test-connection', (req, res) => {
    const settings = req.body;
    console.log('Backend received test request:', settings);

    // This is a simulation. A real implementation would use a MySQL library
    // to attempt a connection with the provided settings.
    if (settings.host && settings.port && settings.username && settings.password && settings.dbname) {
        res.status(200).json({ success: true, message: 'Koneksi berhasil! Database dapat diakses.' });
    } else {
        res.status(400).json({ success: false, message: 'Koneksi gagal. Periksa kembali detail koneksi Anda.' });
    }
});

app.post('/api/save-connection', (req, res) => {
    const settings = req.body;
    console.log('Backend received save request:', settings);

    // This is a simulation. A real implementation would encrypt and store these
    // settings securely.
    if (settings.host && settings.port && settings.username && settings.password && settings.dbname) {
        // We're not actually storing them here, just acknowledging the request.
        res.status(200).json({ success: true, message: 'Pengaturan koneksi berhasil disimpan.' });
    } else {
        res.status(400).json({ success: false, message: 'Gagal menyimpan. Pastikan semua field terisi.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});

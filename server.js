// Note: This is a Node.js Express server. The platform running this code
// needs to support Node.js execution and install dependencies (e.g., express, body-parser, mysql2, cors).
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Using the promise-based version of mysql2
const cors = require('cors');

const app = express();
// The execution environment will likely provide the port.
const PORT = process.env.PORT || 3001; 

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// --- API Routes ---

app.post('/api/test-connection', async (req, res) => {
    const { host, port, username, password, dbname } = req.body;
    console.log('Backend received real test request for:', { host, port, username, dbname });

    if (!host || !port || !username || !dbname) {
        return res.status(400).json({ success: false, message: 'Gagal: Semua field (kecuali password) wajib diisi.' });
    }

    let connection;
    try {
        // Create a connection to the database
        connection = await mysql.createConnection({
            host: host,
            port: parseInt(port, 10),
            user: username,
            password: password,
            database: dbname,
            connectTimeout: 10000 // 10 seconds timeout
        });

        // If connection is successful, immediately close it. We're just testing.
        await connection.end();

        console.log('Database connection test successful.');
        res.status(200).json({ success: true, message: 'Koneksi berhasil! Database dapat diakses.' });

    } catch (error) {
        console.error('Database connection test failed:', error.message);
        // Provide more specific error messages
        let userMessage = 'Koneksi gagal. Periksa kembali detail koneksi Anda.';
        if (error.code === 'ECONNREFUSED') {
            userMessage = 'Koneksi ditolak. Pastikan host dan port sudah benar dan firewall mengizinkan koneksi.';
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            userMessage = 'Akses ditolak. Periksa kembali username dan password Anda.';
        } else if (error.code === 'ENOTFOUND') {
            userMessage = `Host tidak ditemukan: ${host}. Pastikan alamat host sudah benar.`;
        } else if (error.code === 'ER_BAD_DB_ERROR') {
             userMessage = `Database '${dbname}' tidak ditemukan di server.`;
        }
        
        res.status(400).json({ success: false, message: userMessage });
    }
});

app.post('/api/save-connection', (req, res) => {
    const settings = req.body;
    console.log('Backend received save request:', settings);

    // This is a simulation. A real implementation would encrypt and store these
    // settings securely in environment variables or a secrets manager, not in a database or file.
    if (settings.host && settings.port && settings.username && settings.password && settings.dbname) {
        // We're not actually storing them here, just acknowledging the request.
        res.status(200).json({ success: true, message: 'Pengaturan koneksi berhasil disimpan. (Simulasi)' });
    } else {
        res.status(400).json({ success: false, message: 'Gagal menyimpan. Pastikan semua field terisi.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});

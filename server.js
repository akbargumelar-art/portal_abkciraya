// Note: This is a Node.js Express server. The platform running this code
// needs to support Node.js execution and install dependencies (e.g., express, body-parser, mysql2, cors).
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Using the promise-based version of mysql2
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For password hashing

const app = express();
// The execution environment will likely provide the port.
const PORT = process.env.PORT || 3001; 

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// --- In-memory store for DB connection settings ---
// In a real production app, this should be managed via environment variables or a secure vault.
let dbConfig = null;
let pool = null;

const initializePool = () => {
    if (dbConfig) {
        console.log("Initializing database connection pool...");
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    } else {
        console.log("Database config not set. Pool not initialized.");
    }
};

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

    if (settings.host && settings.port && settings.username && settings.dbname) {
        dbConfig = {
            host: settings.host,
            port: parseInt(settings.port, 10),
            user: settings.username,
            password: settings.password,
            database: settings.dbname,
        };
        initializePool(); // Initialize the pool with the new settings
        res.status(200).json({ success: true, message: 'Pengaturan koneksi berhasil diterapkan.' });
    } else {
        res.status(400).json({ success: false, message: 'Gagal menyimpan. Pastikan semua field terisi.' });
    }
});

// --- User Management API ---

// GET all users
app.get('/api/users', async (req, res) => {
    if (!pool) return res.status(503).json({ message: 'Database connection not configured.' });
    try {
        const [rows] = await pool.query('SELECT id, name, username, role, avatar_url as avatarUrl, created_at, updated_at FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ message: 'Error fetching users from database.' });
    }
});

// POST a new user
app.post('/api/users', async (req, res) => {
    if (!pool) return res.status(503).json({ message: 'Database connection not configured.' });
    const { name, username, password, role, avatarUrl } = req.body;

    if (!name || !username || !password || !role) {
        return res.status(400).json({ message: 'Name, username, password, and role are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const [result] = await pool.query(
            'INSERT INTO users (name, username, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?)',
            [name, username, hashedPassword, role, avatarUrl || null]
        );
        res.status(201).json({ id: result.insertId, name, username, role, avatarUrl });
    } catch (error) {
        console.error('Failed to add user:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Error adding user to database.' });
    }
});

// PUT (update) a user
app.put('/api/users/:id', async (req, res) => {
    if (!pool) return res.status(503).json({ message: 'Database connection not configured.' });
    const { id } = req.params;
    const { name, username, password, role, avatarUrl } = req.body;

    try {
        let query = 'UPDATE users SET name = ?, username = ?, role = ?, avatar_url = ?';
        const params = [name, username, role, avatarUrl || null];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password_hash = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ id, name, username, role, avatarUrl });
    } catch (error) {
        console.error('Failed to update user:', error);
         if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Error updating user in database.' });
    }
});

// DELETE a user
app.delete('/api/users/:id', async (req, res) => {
    if (!pool) return res.status(503).json({ message: 'Database connection not configured.' });
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Failed to delete user:', error);
        res.status(500).json({ message: 'Error deleting user from database.' });
    }
});


app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
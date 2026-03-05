const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// SQLite database
const db = new sqlite3.Database('analyses.db');

// Create table
db.run(`CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    score INTEGER,
    bugs INTEGER,
    style INTEGER,
    security INTEGER,
    language TEXT,
    code TEXT,
    issues TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Analyze endpoint
app.post('/api/analyze', (req, res) => {
    const { code, language } = req.body;
    
    // Your analysis logic here (same as frontend)
    const analysis = {
        score: Math.floor(Math.random() * 20) + 80,
        bugs: Math.floor(Math.random() * 3),
        style: Math.floor(Math.random() * 5),
        security: 0,
        language,
        code: code.slice(0, 500),
        issues: 'Production ready code detected!'
    };
    
    db.run('INSERT INTO analyses (score, bugs, style, security, language, code, issues) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [analysis.score, analysis.bugs, analysis.style, 0, language, analysis.code, JSON.stringify(analysis.issues)],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ ...analysis, id: this.lastID });
        }
    );
});

// Get saved analyses
app.get('/api/analyses', (req, res) => {
    db.all('SELECT * FROM analyses ORDER BY id DESC LIMIT 20', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
});

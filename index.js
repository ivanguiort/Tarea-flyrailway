const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MySQL (Railway)
const db = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// RUTAS CRUD

// Servir el HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// LEER (Read)
app.get('/api/items', (req, res) => {
    db.query('SELECT * FROM items ORDER BY codigo DESC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// CREAR (Create)
app.post('/api/items', (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).send("El nombre es requerido.");
    
    db.query('INSERT INTO items (nombre) VALUES (?)', [nombre], (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

// BORRAR (Delete)
app.get('/api/items/delete/:codigo', (req, res) => {
    db.query('DELETE FROM items WHERE codigo = ?', [req.params.codigo], (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

app.listen(port, "0.0.0.0", () => console.log(`Servidor en puerto ${port}`));

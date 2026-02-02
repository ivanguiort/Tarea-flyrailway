const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. CONEXIÓN A MYSQL
const db = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 2. INICIALIZACIÓN DE LA BASE DE DATOS Y TABLA
const initDB = () => {
    db.getConnection((err, connection) => {
        if (err) {
            console.log("MySQL no responde todavía, reintentando en 5s...");
            setTimeout(initDB, 5000);
        } else {
            console.log("Conexión a MySQL exitosa. Creando tabla si no existe...");
            const sql = `CREATE TABLE IF NOT EXISTS items (
                codigo INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL
            )`;
            connection.query(sql, (err) => {
                connection.release();
                if (err) console.error("Error al crear tabla:", err);
                else console.log("Tabla 'items' lista para trabajar.");
            });
        }
    });
};

initDB();

// 3. RUTAS CRUD

// Servir el HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// LEER (Read)
app.get('/api/items', (req, res) => {
    db.query('SELECT * FROM items ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// CREAR (Create)
app.post('/api/items', (req, res) => {
    const { codigo, nombre } = req.body;
    if (!codigo || !nombre) return res.status(400).send("Código y nombre son requeridos.");
    
    db.query('INSERT INTO items (codigo, nombre) VALUES (?, ?)', [codigo, nombre], (err) => {
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


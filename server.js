import express from 'express';
import sqlite3 from 'sqlite3';

const app = express();
app.use(express.json());

const PORT = 3000;

// Creating the database
const db = new sqlite3.Database('products.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL
        )`);
})

// ROOT END POINT
app.get('/', (req, res) => {
    res.send('Welcome!');    
});

// CREATE PRODUCTS END POINT
app.post('/create-products', (req, res) => {
    const { name, price } = req.body;
    const sql = 'INSERT INTO products (name,price) VALUES(?, ?)';

    db.run(sql, [name, price], function(err) {
        if(err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, price });
    });

});

// GET ALL PRODUCTS END POINT
app.get('/get-products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if(err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
})
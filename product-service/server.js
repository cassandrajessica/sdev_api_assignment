import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = 3000;

// CORS too allow requests from other origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// serve frontend static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// connecting db
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

// creating table 
pool.query(`
    CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT,
    price REAL
    )
`)
.then(() => console.log('Product table success'))
.catch(err => console.error('Product table error:', err));

// ROOT END POINT
app.get('/', (req, res) => {
    res.send('Welcome!');    
});

// CREATE PRODUCTS END POINT
app.post('/products', async (req, res) => {
    const { name, price } = req.body;
    try{
        const result = await pool.query(
            'INSERT INTO products (name, price) VALUES($1, $2) RETURNING *',
            [name, price]
        );
        res.status(201).json(result.rows[0]);
    }catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL PRODUCTS END POINT
app.get('/products', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    }catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE PRODUCT 
app.get('/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if(result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found'});
        }
        res.json(result.rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message});
    }
})

// Proxy order requests to order-service
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';

app.get('/orders', async (req, res) => {
    try {
        const response = await fetch(`${ORDER_SERVICE_URL}/orders`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Order service unavailable' });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const response = await fetch(`${ORDER_SERVICE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Order service unavailable' });
    }
});

app.delete('/orders/:id', async (req, res) => {
    try {
        const response = await fetch(`${ORDER_SERVICE_URL}/orders/${req.params.id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Order service unavailable' });
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
})
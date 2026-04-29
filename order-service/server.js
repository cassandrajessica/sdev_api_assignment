import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

const ORDER_PORT = 3002;

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3000';

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
    CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    total REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`)
.then(() => console.log('Orders table success'))
.catch(err => console.error('Order table error:', err));

// ROOT END POINT
app.get('/', (req, res) => {
    res.send('Welcome!');    
});

// CREATE PRODUCTS END POINT
app.post('/orders', async (req, res) => {
    const { product_id, quantity } = req.body;
    try{
        const productResponse = await fetch(`${PRODUCT_SERVICE_URL}/products/${product_id}`);

        if(!productResponse.ok) {
            return res.status(404).json({ error: 'Product not found'});
        }

        const product = await productResponse.json();

        const total = product.price * quantity;

        const result = await pool.query(
            'INSERT INTO orders (product_id, product_name, product_price, quantity, total) VALUES($1, $2, $3, $4, $5) RETURNING *', [product_id, product.name, product.price, quantity, total]
        );

        res.status(201).json(result.rows[0]);
    }catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL PRODUCTS END POINT
app.get('/orders', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    }catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(ORDER_PORT, () => {
    console.log(`Listening on port ${ORDER_PORT}...`);
})
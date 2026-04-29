import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = 3000;

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
app.get('product/:id', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
})
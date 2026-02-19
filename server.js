import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3000;

let products = [];

app.get('/', (req, res) => {
    res.send('Welcome!');    
});

app.post('/create-products', (req, res) => {
    const { name, price } = req.body;
    const product = {
        id: Date.now(),
        name,
        price
    } 

    products.push(product);

    console.log('Product created: ',product);

    res.status(201).json({
        message: 'Succesfully created',
        product: product
    })

});

app.get('/get-products', (req, res) => {
    res.status(200).json({
        message: 'Sucessfully retrieved all products',
        products: products,
    })
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
})
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'CodeVector product API is running',
        endpoints: {
            products: '/api/products',
            categories: '/api/products/categories',
        },
    });
});

// app.get('/health', (req, res) => {
//     res.json({ status: 'ok' });
// });

app.use('/api', productRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
});

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(error.message);
        process.exit(1);
    });

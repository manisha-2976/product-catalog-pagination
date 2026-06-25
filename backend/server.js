require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://product-catalog-pagination.vercel.app",
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
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

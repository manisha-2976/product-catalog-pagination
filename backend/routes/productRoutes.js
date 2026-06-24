const express = require('express');
const {
    getProducts,
    getCategories,
} = require('../controllers/productController');

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/categories', getCategories);

module.exports = router;

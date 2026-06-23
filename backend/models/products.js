const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    id: {type: String, required: true},
    name: String,
    category: String,
    price: Number,
    created_at: Date,
    updated_at: Date,
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
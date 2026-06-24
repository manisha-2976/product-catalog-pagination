const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: String,
    category: String,
    price: Number,
    created_at: Date,
    updated_at: Date,
});

productSchema.index({ created_at: -1, _id: -1 });
productSchema.index({ category: 1, created_at: -1, _id: -1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

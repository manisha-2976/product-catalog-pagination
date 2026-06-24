const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// const initData = require('./data.js');
const mongoose = require('mongoose');
const Product = require('../models/products.js');

const dbUrl = process.env.ATLASDB_URL;

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    if (!dbUrl) {
        throw new Error('ATLASDB_URL is missing. Add it to backend/.env before running this script.');
    }

    await mongoose.connect(dbUrl);
}

const initDB = async () => {
    await Product.deleteMany({});
    await Product.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();


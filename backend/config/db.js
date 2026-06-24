const mongoose = require('mongoose');

const connectDB = async () => {
    const dbUrl = process.env.ATLASDB_URL || process.env.MONGODB_URI;

    if (!dbUrl) {
        throw new Error('ATLASDB_URL is missing. Add your MongoDB connection string to backend/.env');
    }

    await mongoose.connect(dbUrl);
    console.log('MongoDB connected');
};

module.exports = connectDB;

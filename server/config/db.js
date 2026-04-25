const mongoose = require('mongoose');

/**
 * connectDB — Establishes connection to MongoDB.
 * The MONGO_URI must be provided by the user via .env — never hardcoded.
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
    console.error('❌ MONGO_URI is not defined in .env file');
    console.error('👉 Please add your MongoDB URI to the .env file and restart the server.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB error: ${err.message}`);
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

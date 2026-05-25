// ============================================================
// Database Configuration — connects to MongoDB via Mongoose
// ============================================================

const mongoose = require('mongoose');

/**
 * connectDB()
 * Establishes a connection to MongoDB using the MONGO_URI
 * environment variable. Logs success or exits the process
 * on failure so the app doesn't run without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1); // Exit with failure — the app cannot function without a DB
  }
};

module.exports = connectDB;

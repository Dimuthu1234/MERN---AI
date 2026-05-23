// =========================================================
// MongoDB connection — using Mongoose
// =========================================================

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI not set — check your .env file');
  }

  // mongoose >= 6 has good defaults — no extra options needed
  await mongoose.connect(uri);

  console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongo connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  Mongo disconnected');
  });
}

module.exports = connectDB;

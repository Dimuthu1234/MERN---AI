// =========================================================
// Example 01 — Mongoose Connect
// Run: node 01-mongoose-connect.js
// =========================================================
//
// Concept: Mongoose is a Node.js library that connects to MongoDB
// and gives us a nice OO-style API (schemas, models, validation).
//
// Steps:
//   1. require('mongoose')
//   2. mongoose.connect(URI)
//   3. listen on 'connected' / 'error' events
//   4. mongoose.disconnect() when done

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/day07tasks';

async function main() {
  console.log('Connecting to:', MONGO_URI);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected. Database name:', mongoose.connection.name);
    console.log('   Ready state:', mongoose.connection.readyState, '(1 = connected)');

    // List collections — should be empty on first run
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('   Collections in this DB:', collections.map(c => c.name));
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
  }
}

main();

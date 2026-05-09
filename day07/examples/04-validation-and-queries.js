// =========================================================
// Example 04 — Validation + Query Filters
// Run: node 04-validation-and-queries.js
// =========================================================
//
// Mongoose query operators (a few common ones):
//   $eq, $ne          — equal / not equal
//   $gt, $gte, $lt    — greater / less than
//   $in, $nin         — in / not in array
//   $regex            — pattern match (like SQL LIKE)
//
// Sort + limit + select:
//   .sort({ createdAt: -1 })   → newest first
//   .limit(10)                 → only first 10
//   .select('title -_id')      → return only these fields

require('dotenv').config();
const mongoose = require('mongoose');

const Task = mongoose.model(
  'Task',
  new mongoose.Schema(
    {
      title:    { type: String,  required: [true, 'title is required'], minlength: 2, maxlength: 100 },
      priority: { type: String,  enum: ['low', 'medium', 'high'], default: 'medium' },
      completed:{ type: Boolean, default: false },
      tags:     { type: [String], default: [] },
    },
    { timestamps: true }
  )
);

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/day07tasks');
  await Task.deleteMany({});

  // ===== Try invalid doc =====
  try {
    await Task.create({ title: 'A' });          // too short
  } catch (err) {
    console.log('❌ Validation caught:', err.errors.title.message);
  }

  // ===== Seed data =====
  await Task.insertMany([
    { title: 'Read about indexes',    priority: 'low',    tags: ['db', 'reading']  },
    { title: 'Build login endpoint',  priority: 'high',   tags: ['auth']           },
    { title: 'Write tests',           priority: 'medium', tags: ['quality']        },
    { title: 'Deploy to Render',      priority: 'high',   tags: ['devops']         },
    { title: 'Polish UI',             priority: 'low',    tags: ['frontend']       },
  ]);
  console.log('✅ Seeded 5 tasks');

  // ===== Query: only high priority =====
  const high = await Task.find({ priority: 'high' });
  console.log('\n🔥 high:', high.map(t => t.title));

  // ===== Query: priority IN ['high','medium'] =====
  const important = await Task.find({ priority: { $in: ['high', 'medium'] } });
  console.log('⭐ important:', important.map(t => t.title));

  // ===== Query: title contains "build" (case-insensitive) =====
  const matching = await Task.find({ title: { $regex: 'build', $options: 'i' } });
  console.log('🔎 matching "build":', matching.map(t => t.title));

  // ===== Query: tag includes "devops" =====
  const devops = await Task.find({ tags: 'devops' });
  console.log('🛠  devops tasks:', devops.map(t => t.title));

  // ===== Sort + limit =====
  const newest = await Task.find().sort({ createdAt: -1 }).limit(2).select('title -_id');
  console.log('\n🆕 newest 2 (titles only):', newest.map(t => t.title));

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });

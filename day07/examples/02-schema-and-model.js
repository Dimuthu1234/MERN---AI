// =========================================================
// Example 02 — Schema + Model
// Run: node 02-schema-and-model.js
// =========================================================
//
// Schema — describes the SHAPE of a document (like a class).
// Model — the actual interface we use to query the DB
//         (mongoose.model('Task', schema) → Task.find(), Task.create()).
//
// Mongoose adds:
//   - Type checking (only Strings in 'title' field)
//   - Defaults (priority defaults to 'medium')
//   - Validators (required, enum, min, max)
//   - timestamps: true → adds createdAt + updatedAt automatically

require('dotenv').config();
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title:    { type: String,  required: true, trim: true, minlength: 2 },
    priority: { type: String,  enum: ['low', 'medium', 'high'], default: 'medium' },
    completed:{ type: Boolean, default: false },
  },
  { timestamps: true }   // adds createdAt + updatedAt
);

// Model name 'Task' → MongoDB collection 'tasks' (auto-pluralized lowercase)
const Task = mongoose.model('Task', taskSchema);

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/day07tasks');

  // Build a doc — NOT saved yet
  const t = new Task({ title: 'Learn schemas' });
  console.log('Built (unsaved):', t.toObject());
  console.log('isNew?', t.isNew);

  // Validate without saving
  try {
    await t.validate();
    console.log('✅ Schema validation passed');
  } catch (err) {
    console.log('❌ Validation error:', err.message);
  }

  // Try a BAD doc to see validation in action
  try {
    const bad = new Task({ title: 'X', priority: 'urgent' }); // X = too short, urgent = not in enum
    await bad.validate();
  } catch (err) {
    console.log('\n❌ Bad doc errors:');
    Object.values(err.errors).forEach(e => console.log('   -', e.message));
  }

  await mongoose.disconnect();
}

main();

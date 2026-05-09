// =========================================================
// Example 03 — CRUD Operations
// Run: node 03-crud-operations.js
// =========================================================
//
// CREATE  — Task.create() / new Task().save()
// READ    — Task.find() / Task.findById() / Task.findOne()
// UPDATE  — Task.findByIdAndUpdate() / doc.save()
// DELETE  — Task.findByIdAndDelete() / Task.deleteMany()

require('dotenv').config();
const mongoose = require('mongoose');

const Task = mongoose.model(
  'Task',
  new mongoose.Schema(
    {
      title:    { type: String,  required: true },
      priority: { type: String,  default: 'medium' },
      completed:{ type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/day07tasks');

  // Clean slate so re-runs are consistent
  await Task.deleteMany({});
  console.log('🧹 Cleared tasks collection');

  // ===== CREATE =====
  const t1 = await Task.create({ title: 'Setup MongoDB', priority: 'high' });
  console.log('\n➕ Created:', t1._id.toString(), '-', t1.title);

  // Bulk create
  await Task.insertMany([
    { title: 'Define schema',         priority: 'high'   },
    { title: 'Write CRUD routes',     priority: 'medium' },
    { title: 'Connect React frontend',priority: 'low'    },
  ]);
  console.log('➕ Bulk inserted 3 more');

  // ===== READ =====
  const all = await Task.find();
  console.log('\n📋 All tasks (count =', all.length, ')');
  all.forEach(t => console.log('   •', t.title, `[${t.priority}]`));

  const high = await Task.find({ priority: 'high' });
  console.log('\n🔥 High priority:', high.length, 'task(s)');

  const one = await Task.findById(t1._id);
  console.log('🔎 findById:', one.title);

  // ===== UPDATE =====
  const updated = await Task.findByIdAndUpdate(
    t1._id,
    { completed: true },
    { new: true }       // return the UPDATED doc, not the old one
  );
  console.log('\n✏️  Updated:', updated.title, '→ completed =', updated.completed);

  // ===== DELETE =====
  const deleted = await Task.findByIdAndDelete(t1._id);
  console.log('🗑️  Deleted:', deleted.title);

  const finalCount = await Task.countDocuments();
  console.log('\n🧮 Final count:', finalCount);

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });

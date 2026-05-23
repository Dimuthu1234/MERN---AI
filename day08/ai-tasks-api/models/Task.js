// =========================================================
// Task Model — extended for Day 08
//
// New fields vs Day 07:
//   - tags: array of strings   (populated by /ai/categorize)
//   - subtasks: array of subdocs { title, done } (populated by /ai/suggest-subtasks)
//   - aiMeta: when AI last touched this task (for audit / cost analysis)
// =========================================================

const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    done:  { type: Boolean, default: false },
  },
  { _id: true, timestamps: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      minlength: [2, 'title must be at least 2 characters'],
      maxlength: [200, 'title is too long (max 200)'],
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'priority must be low, medium, or high',
      },
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },

    // ----- NEW in day 08 -----
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((t) => /^[a-z0-9-]+$/i.test(t)),
        message: 'tags must be alphanumeric or hyphenated',
      },
    },
    subtasks: { type: [subtaskSchema], default: [] },

    aiMeta: {
      lastCategorizedAt: { type: Date, default: null },
      lastEnhancedAt:    { type: Date, default: null },
      lastSubtaskGenAt:  { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Clean JSON output — same trick as day 07.
taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    if (Array.isArray(ret.subtasks)) {
      ret.subtasks = ret.subtasks.map((s) => ({ id: s._id.toString(), title: s.title, done: s.done }));
    }
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);

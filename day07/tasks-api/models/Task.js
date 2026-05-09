// =========================================================
// Task Model — Mongoose schema for tasks collection
// =========================================================

const mongoose = require('mongoose');

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
      maxlength: 1000,
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
  },
  {
    timestamps: true,   // adds createdAt + updatedAt
    versionKey: false,  // hides __v field in responses
  }
);

// Optional — clean up the JSON Mongo returns to clients
taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);

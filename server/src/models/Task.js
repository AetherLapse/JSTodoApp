const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: String,
  done: { type: Boolean, default: false }
});

const attachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  size: Number
});

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, index: true },
    description: String,
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: Date,
    tags: [{ type: String }],
    subtasks: [subtaskSchema],
    attachments: [attachmentSchema]
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, status: 1, priority: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);

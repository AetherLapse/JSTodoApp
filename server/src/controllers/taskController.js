const { z } = require('zod');
const Task = require('../models/Task');

const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  subtasks: z.array(z.object({ title: z.string(), done: z.boolean().optional() })).optional()
});

async function list(req, res) {
  const tasks = await Task.find({ userId: req.user.id });
  res.json({ success: true, data: tasks });
}

async function create(req, res) {
  const parse = taskSchema.pick({ title: true, description: true, status: true, priority: true, dueDate: true, tags: true, subtasks: true }).safeParse(req.body);
  if (!parse.success) return res.status(400).json({ success: false, error: parse.error.issues });
  const task = await Task.create({ userId: req.user.id, ...parse.data });
  res.status(201).json({ success: true, data: task });
}

async function getTask(req, res) {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
  if (!task) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: task });
}

async function update(req, res) {
  const parse = taskSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ success: false, error: parse.error.issues });
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    parse.data,
    { new: true }
  );
  if (!task) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: task });
}

async function remove(req, res) {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!task) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true });
}

module.exports = { list, create, getTask, update, remove };

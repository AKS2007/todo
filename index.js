import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 4000;
const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, 'tasks.json');
app.use(cors());
app.use(express.json());
let collection;
let localTasks = [];
async function connectStore() {
  if (process.env.MONGODB_URI) {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    collection = client.db(process.env.MONGODB_DB || 'daymark').collection('tasks');
    console.log('Connected to MongoDB');
  } else {
    try { localTasks = JSON.parse(await readFile(dataFile, 'utf8')); } catch { localTasks = []; }
    console.log('Using local JSON storage (set MONGODB_URI for MongoDB)');
  }
}
const serialize = task => ({ ...task, id: task._id?.toString() ?? task.id });
async function allTasks() {
  return collection
    ? (await collection.find().sort({ createdAt: -1 }).toArray()).map(serialize)
    : [...localTasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
async function saveLocal() { await writeFile(dataFile, JSON.stringify(localTasks, null, 2)); }
function validate(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title || title.length > 140) return { error: 'Add a title with 1–140 characters.' };
  if (body.priority && !['low', 'medium', 'high'].includes(body.priority)) return { error: 'Choose a valid priority.' };
  return { title, description: String(body.description || '').trim().slice(0, 500), dueDate: body.dueDate || '', priority: body.priority || 'medium' };
}
app.get('/api/tasks', async (_req, res) => {
  try { res.json(await allTasks()); } catch { res.status(500).json({ error: 'Could not load tasks.' }); }
});
app.post('/api/tasks', async (req, res) => {
  const fields = validate(req.body);
  if (fields.error) return res.status(400).json(fields);
  const task = { ...fields, completed: false, createdAt: new Date().toISOString() };
  try {
    if (collection) { const result = await collection.insertOne(task); task._id = result.insertedId; }
    else { task.id = randomUUID(); localTasks.unshift(task); await saveLocal(); }
    res.status(201).json(serialize(task));
  } catch { res.status(500).json({ error: 'Could not save task.' }); }
});
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (collection) {
      if (!ObjectId.isValid(id)) return res.status(404).json({ error: 'Task not found.' });
      const patch = {};
      if (typeof req.body.completed === 'boolean') patch.completed = req.body.completed;
      if (req.body.title !== undefined) {
        const fields = validate({ ...req.body, priority: req.body.priority || 'medium' });
        if (fields.error) return res.status(400).json(fields);
        Object.assign(patch, fields);
      }
      const task = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: patch }, { returnDocument: 'after' });
      if (!task) return res.status(404).json({ error: 'Task not found.' });
      return res.json(serialize(task));
    }
    const task = localTasks.find(item => item.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    if (typeof req.body.completed === 'boolean') task.completed = req.body.completed;
    if (req.body.title !== undefined) {
      const fields = validate({ ...task, ...req.body });
      if (fields.error) return res.status(400).json(fields);
      Object.assign(task, fields);
    }
    await saveLocal();
    res.json(task);
  } catch { res.status(500).json({ error: 'Could not update task.' }); }
});
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (collection) {
      if (!ObjectId.isValid(id)) return res.status(404).json({ error: 'Task not found.' });
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (!result.deletedCount) return res.status(404).json({ error: 'Task not found.' });
    } else {
      const before = localTasks.length;
      localTasks = localTasks.filter(task => task.id !== id);
      if (localTasks.length === before) return res.status(404).json({ error: 'Task not found.' });
      await saveLocal();
    }
    res.status(204).end();
  } catch { res.status(500).json({ error: 'Could not delete task.' }); }
});
await connectStore();
const dist = path.resolve(here, 'dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(port, () => console.log('Daymark API ready at http://localhost:' + port));

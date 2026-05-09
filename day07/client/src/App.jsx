import { useEffect, useState } from 'react';
import { TasksAPI } from './api';

const PRIORITY_COLORS = {
  low:    'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-700',
  high:   'bg-rose-100 text-rose-700',
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    try {
      setLoading(true);
      const data = await TasksAPI.list();
      setTasks(data.tasks || []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await TasksAPI.create({ title, priority });
      setTitle('');
      setPriority('medium');
      refresh();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  }

  async function toggleDone(t) {
    await TasksAPI.update(t.id, { completed: !t.completed });
    refresh();
  }

  async function remove(id) {
    if (!confirm('Delete this task?')) return;
    await TasksAPI.remove(id);
    refresh();
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1">Day 07 — Tasks</h1>
      <p className="text-slate-500 mb-6">MERN practical · Mongo + Express + React + Node</p>

      <form onSubmit={addTask} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-2">
        <input
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What needs doing?"
        />
        <select
          className="border border-slate-300 rounded-lg px-2 py-2"
          value={priority}
          onChange={e => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
          Add
        </button>
      </form>

      {error && <div className="bg-rose-50 text-rose-700 p-3 rounded-lg mb-4">{error}</div>}
      {loading && <div className="text-slate-500">Loading…</div>}

      <ul className="space-y-2">
        {tasks.map(t => (
          <li
            key={t.id}
            className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3"
          >
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggleDone(t)}
              className="h-5 w-5 accent-indigo-600"
            />
            <div className="flex-1">
              <div className={t.completed ? 'line-through text-slate-400' : 'font-medium'}>
                {t.title}
              </div>
              <div className="text-xs text-slate-500">
                {t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_COLORS[t.priority]}`}>
              {t.priority}
            </span>
            <button
              onClick={() => remove(t.id)}
              className="text-rose-600 hover:text-rose-800 text-sm font-medium"
            >
              Delete
            </button>
          </li>
        ))}
        {!loading && tasks.length === 0 && (
          <li className="text-slate-400 text-center py-8">No tasks yet. Add one above.</li>
        )}
      </ul>
    </div>
  );
}

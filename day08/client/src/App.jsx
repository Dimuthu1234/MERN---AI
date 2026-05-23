import { useEffect, useState } from 'react';
import { TasksAPI, AI } from './api';

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
  const [busyId, setBusyId] = useState(null);   // tracks which task has an AI call in flight
  const [busyKind, setBusyKind] = useState(''); // e.g. "categorize" / "enhance" / "subtasks"
  const [usage, setUsage] = useState(null);

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

  async function refreshUsage() {
    try { setUsage(await AI.usage()); } catch { /* ignore */ }
  }

  useEffect(() => { refresh(); refreshUsage(); }, []);

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

  // ─── AI handlers ───
  async function runCategorize(t) {
    setBusyId(t.id); setBusyKind('categorize'); setError('');
    try {
      const { priority, tags } = await AI.categorize(t.title);
      await TasksAPI.update(t.id, { priority, tags });
      await refresh();
      await refreshUsage();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusyId(null); setBusyKind('');
    }
  }

  async function runEnhance(t) {
    setBusyId(t.id); setBusyKind('enhance'); setError('');
    try {
      const { description } = await AI.enhance(t.title);
      await TasksAPI.update(t.id, { description });
      await refresh();
      await refreshUsage();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusyId(null); setBusyKind('');
    }
  }

  async function runSubtasks(t) {
    setBusyId(t.id); setBusyKind('subtasks'); setError('');
    try {
      await AI.subtasks(t.id);   // server persists subtasks[] to DB
      await refresh();
      await refreshUsage();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusyId(null); setBusyKind('');
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Day 08 — AI Tasks ✨</h1>
          <p className="text-slate-500">MERN + Claude · categorize · enhance · subtasks</p>
        </div>
        {usage && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Today's AI spend</p>
            <p className="text-sm font-semibold">${usage.spentUsd.toFixed(4)}</p>
            <p className="text-xs text-slate-400">
              {usage.callsToday} calls · cap ${usage.capUsd.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <form
        onSubmit={addTask}
        className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-2"
      >
        <input
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
        />
        <select
          className="border border-slate-300 rounded-lg px-2 py-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
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

      <ul className="space-y-3">
        {tasks.map((t) => {
          const isBusy = busyId === t.id;
          return (
            <li
              key={t.id}
              className="bg-white p-4 rounded-xl border border-slate-200"
            >
              {/* Title row */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleDone(t)}
                  className="h-5 w-5 accent-indigo-600"
                />
                <div className="flex-1 min-w-0">
                  <div className={t.completed ? 'line-through text-slate-400' : 'font-medium'}>
                    {t.title}
                  </div>
                  <div className="text-xs text-slate-400">
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
              </div>

              {/* Description (set by ✨ Enhance) */}
              {t.description && (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-8">{t.description}</p>
              )}

              {/* Tags (set by ✨ Categorize) */}
              {t.tags?.length > 0 && (
                <div className="mt-2 flex gap-1 pl-8 flex-wrap">
                  {t.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Subtasks (set by ✨ Subtasks) */}
              {t.subtasks?.length > 0 && (
                <ul className="mt-3 pl-8 space-y-1">
                  {t.subtasks.map((s) => (
                    <li key={s.id} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="text-slate-400">•</span>
                      <span className={s.done ? 'line-through text-slate-400' : ''}>{s.title}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* AI buttons */}
              <div className="mt-3 pl-8 flex gap-2 flex-wrap">
                <AIButton
                  busy={isBusy && busyKind === 'categorize'}
                  disabled={isBusy}
                  onClick={() => runCategorize(t)}
                  label="✨ Categorize"
                />
                <AIButton
                  busy={isBusy && busyKind === 'enhance'}
                  disabled={isBusy}
                  onClick={() => runEnhance(t)}
                  label="✨ Enhance"
                />
                <AIButton
                  busy={isBusy && busyKind === 'subtasks'}
                  disabled={isBusy}
                  onClick={() => runSubtasks(t)}
                  label="✨ Subtasks"
                />
              </div>
            </li>
          );
        })}

        {!loading && tasks.length === 0 && (
          <li className="text-slate-400 text-center py-8">
            No tasks yet. Add one above — then click any ✨ button to see AI in action.
          </li>
        )}
      </ul>
    </div>
  );
}

function AIButton({ busy, disabled, onClick, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
        busy
          ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
          : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {busy ? 'Thinking…' : label}
    </button>
  );
}

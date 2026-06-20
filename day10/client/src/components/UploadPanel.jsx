import { useState } from 'react';
import { ingestDocument, summariseDocument } from '../lib/api.js';

export default function UploadPanel({ doc, onLoaded }) {
  const [title, setTitle] = useState('');
  const [fullText, setFullText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [summarising, setSummarising] = useState(false);

  async function handleLoad() {
    if (!fullText.trim() || loading) return;
    setLoading(true);
    setError('');
    setSummary(null);
    try {
      const data = await ingestDocument({ title: title.trim() || 'Untitled', fullText });
      onLoaded({ id: data.id, chunkCount: data.chunkCount, title: title.trim() || 'Untitled' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarise() {
    if (!doc || summarising) return;
    setSummarising(true);
    setError('');
    try {
      setSummary(await summariseDocument(doc.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSummarising(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Document
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Paste any text, load it, then chat with it on the right.
        </p>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title (optional)"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm
                   outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
      />

      <textarea
        value={fullText}
        onChange={(e) => setFullText(e.target.value)}
        placeholder="Paste your document here…"
        className="min-h-[220px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3
                   text-sm leading-relaxed outline-none transition scroll-thin
                   focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
      />

      <button
        onClick={handleLoad}
        disabled={!fullText.trim() || loading}
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                   transition hover:bg-indigo-700 active:scale-[0.99]
                   disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {loading ? 'Loading…' : 'Load document'}
      </button>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
          {error}
        </div>
      )}

      {doc && (
        <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{doc.title}</p>
              <p className="text-xs text-slate-400">
                Loaded · <span className="font-medium text-indigo-600">{doc.chunkCount}</span>{' '}
                {doc.chunkCount === 1 ? 'chunk' : 'chunks'}
              </p>
            </div>
            <button
              onClick={handleSummarise}
              disabled={summarising}
              className="shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs
                         font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
            >
              {summarising ? 'Summarising…' : 'Summarise'}
            </button>
          </div>

          {summary && (
            <div className="mt-4 animate-fade-in-up border-t border-slate-100 pt-4">
              <p className="text-sm leading-relaxed text-slate-700">{summary.summary}</p>
              {summary.keyPoints?.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {summary.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

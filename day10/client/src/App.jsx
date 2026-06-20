import { useState } from 'react';
import UploadPanel from './components/UploadPanel.jsx';
import ChatWidget from './components/ChatWidget.jsx';

export default function App() {
  const [doc, setDoc] = useState(null); // { id, chunkCount, title }

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-6 sm:px-6">
      {/* Header */}
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-lg text-white shadow-sm">
          📄
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">DocChat AI</h1>
          <p className="text-xs text-slate-400">Paste a document and chat with it.</p>
        </div>
      </header>

      {/* Two-pane layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Left: upload */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <UploadPanel doc={doc} onLoaded={setDoc} />
        </section>

        {/* Right: chat (disabled until a doc loads) */}
        <section className="relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {doc ? (
            // key={doc.id} -> fresh chat state whenever a new document is loaded
            <ChatWidget key={doc.id} docId={doc.id} docTitle={doc.title} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-slate-400">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                🔒
              </div>
              <p className="text-sm font-medium text-slate-500">Load a document to start chatting</p>
              <p className="mt-1 text-xs">The chat unlocks once your document is indexed.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

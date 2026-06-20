import mongoose from 'mongoose';

// Section 2 (Slides 9–12): one conversation per document. We persist every turn
// and keep a rolling `summary` so long chats don't blow the context window.
const conversationSchema = new mongoose.Schema({
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', index: true },
  messages: [{ role: String, content: String }],
  summary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

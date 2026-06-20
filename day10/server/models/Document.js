import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fullText: { type: String, required: true },
  chunks: [{ index: Number, text: String }], // Section 3, Slide 15 — RAG foundation
  createdAt: { type: Date, default: Date.now },
});

export const Document =
  mongoose.models.Document || mongoose.model('Document', documentSchema);

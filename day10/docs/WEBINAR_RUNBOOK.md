# WEBINAR_RUNBOOK.md — Session 8 (පැය 2)

DocChat AI · AI Integration Part 2 · AcademyDSJ MERN + AI Live Batch 2026

මුළු class එක **පැය 2 (මිනිත්තු 120)**. පළමු කොටස presentation එක (concepts), දෙවෙනි කොටස
practical එක (Claude Code එක්ක live build). Timeline එක guideline එකක් — lab එකේ වේගය අනුව adjust කරන්න.

## Pre-class setup (class එකට කලින් — මිනිත්තු 10)
- [ ] `mongod` run වෙනවද බලන්න.
- [ ] හිස් `docchat-ai/` folder එකක් හදලා `CLAUDE.md` එක ඒකට copy කරන්න.
- [ ] `claude` CLI එක වැඩද බලන්න (`npm i -g @anthropic-ai/claude-code`).
- [ ] `ANTHROPIC_API_KEY` එක ලෑස්තිද බලන්න. `presentation-guide.html` එක browser එකේ open කරගන්න.
- [ ] `server-snippets/` + `client-snippets/` open කරගෙන තියන්න (safety net).

---

## කොටස 1 — Presentation / Concepts (මිනිත්තු 0–45)

`presentation-guide.html` එක screen-share කරලා, section එකින් එක යනවා.

| වෙලාව | මොනවද | Slide ref |
|-------|-------|-----------|
| 0–5   | Intro + අද හදන දේ (DocChat AI demo එකක් පෙන්නන්න) | 1–2 |
| 5–13  | **Section 1** — Chatbot UI, optimistic, streaming | 3–7 |
| 13–20 | **Section 2** — Context windows, tokens, summarisation | 8–12 |
| 20–30 | **Section 3** — RAG: chunk → embed → retrieve | 13–19 |
| 30–35 | **Section 4** — Draft→Polish, structured JSON | 20–24 |
| 35–42 | **Section 5** — Tool use / function calling | 25–30 |
| 42–45 | **Section 6** — Safety: injection, validation, fallbacks | 31–38 |

> 💡 හැම section එකකම අන්තිමේ තියෙන **"සාරාංශය" (recap)** box එක කියවන්න — එතනින් core idea එක තහවුරු වෙනවා.

**මිනිත්තු 45 — කෙටි break / Q&A (මිනිත්තු 5).**

---

## කොටස 2 — Practical: DocChat AI live build (මිනිත්තු 50–118)

`docs/PROMPTS.md` එකෙන් prompt එකින් එක Claude Code එකට paste කරනවා. හැම එකකට පස්සෙම demo.

| වෙලාව | Prompt | මොකද වෙන්නේ | Demo |
|-------|--------|-------------|------|
| 50–60  | **Prompt 1** | Backend scaffold + document ingest (chunking) | curl POST /api/docs → chunks in Mongo |
| 60–72  | **Prompt 2** | AI service: lexical retrieval + summarise (JSON) | /api/ai/summarise → clean JSON |
| 72–88  | **Prompt 3** | Streaming chat + `search_document` tool (RAG via tool use) | curl stream + tool call in logs |
| 88–98  | **Prompt 4** | Safety: injection + rate limit + fallback | injection message → safe refusal |
| 98–115 | **Prompt 5** | React client: upload + streaming chat UI | full app working in browser 🎉 |
| 115–118| **Prompt 6** | (bonus) multi-turn summarisation | payload stops growing |

**මිනිත්තු 118–120 — Wrap up:** අද හදපු app එකේ 6 සංකල්පයම නැවත සම්බන්ධ කරන්න
(presentation එකේ practical box එක පෙන්නලා). Homework + ඊළඟ session එක.

---

## ⏱ වෙලාව මදි වුණොත් (cut order)
1. Prompt 6 (multi-turn) — මුලින්ම අත්හරින්න.
2. Prompt 2 එකේ summarise කොටස — chat එක වැඩ කරාම ආපහු එන්න.
3. Prompt 4 එකේ rate-limiter — injection guard එක විතරක් තියලා rate limit skip කරන්න.

## 🧯 කෑදුණොත් (recovery)
- PROMPTS.md එකේ **Recovery prompts** section එක පාවිච්චි කරන්න.
- ඒකෙනුත් හරි ගියේ නැත්නම් → `*-snippets/` වලින් අදාළ file එක paste කරලා, explain කරලා, ඉදිරියට.
- Stream/tool/JSON යන තුනම common — ඒ ටික කලින්ම කියවලා තියන්න.

## ✅ Homework (ශිෂ්‍යයන්ට)
1. `searchChunks` එක production එකට — OpenAI/Voyage embeddings + cosine similarity වලට මාරු කරන්න (Slides 16–18).
2. PDF upload එකක් එකතු කරන්න (`pdf-parse` එකෙන් text extract කරලා ingest කරන්න).
3. Chat history එක browser එකේ පෙන්නන්න (page reload වුණත් session එක load වෙන්න — Slide 10).

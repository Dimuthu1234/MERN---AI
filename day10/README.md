# Day 10 — DocChat AI · Session 8: AI Integration Part 2

AcademyDSJ · MERN + AI Live Batch 2026. මේ folder එකේ අද class එක run කරන්න ඕනේ
ඔක්කොම තියෙනවා — **සරල සිංහල presentation guide එකක්** + **Claude Code එක්ක live හදන
practical එකක්** (DocChat AI).

මේ package එක **finished repo එකක් නෙවෙයි** — day09 (ShopWave AI) වගේම, Claude Code
එක prompts වලින් app එක live generate කරනවා. `*-snippets/` folders තියෙන්නේ safety net
එකක් විදිහට (live generation එකක් හිර වුණොත් paste කරන්න).

## මොනවද ඇතුළේ

```
day10/
├── presentation-guide.html      # ⭐ slides 39ම සරල සිංහලෙන් — browser එකේ open කරන්න
├── CLAUDE.md                     # project context (docchat-ai/ repo root එකට දාන්න)
├── docs/
│   ├── PROMPTS.md                # ⭐ Claude Code එකට paste කරන prompts (පිළිවෙලට)
│   ├── WEBINAR_RUNBOOK.md         # පැය 2 minute-by-minute plan
│   └── presentation-8-slides.json # original slide data (reference)
├── server-snippets/              # reference backend (safety net)
│   ├── ai.service.js             # Anthropic client — chunk, retrieve, stream+tool, summarise
│   ├── ai.routes.js              # SSE chat + summarise + injection guard
│   ├── safety.js                 # rate limiter + injection detection
│   └── server-core.js            # index/db/models/docs.routes combined
└── client-snippets/
    └── frontend-reference.jsx    # api, useChat hook, UploadPanel, ChatWidget
```

## පාවිච්චි කරන හැටි

1. **Class එකට කලින්:** `WEBINAR_RUNBOOK.md` කියවන්න. Pre-class setup කරන්න.
   හිස් `docchat-ai/` folder එකක් හදලා `CLAUDE.md` ඒකට දාන්න.
2. **Class එකේ පළමු කොටස:** `presentation-guide.html` screen-share කරලා, section 6ම යන්න.
3. **Class එකේ දෙවෙනි කොටස:** `PROMPTS.md` එකේ prompt 1→6 පිළිවෙලට Claude Code එකට paste
   කරන්න. හැම එකකට පස්සෙම demo කරන්න.
4. **කෑදුණොත්:** `*-snippets/` වලින් අදාළ file එක paste කරලා, explain කරලා, ඉදිරියට.

## DocChat AI — මොකක්ද?

Document එකක් paste/upload කරලා, **ඒක උඩින් streaming chat එකක් කරන්න පුළුවන් AI assistant**
එකක්. මේ එක app එකෙන් Session 8හි **6 සංකල්පයම** ස්පර්ශ වෙනවා:

1. **Streaming chat UI** + optimistic messages (Section 1)
2. **Multi-turn** conversation + auto-summarise (Section 2)
3. **Document → chunk → retrieve (RAG)** (Section 3)
4. **"Summarise" generation** — structured JSON output (Section 4)
5. **Tool use** — assistant ට `search_document` tool එකක් (Section 5)
6. **Safety** — injection guard + rate limit + safe fallback (Section 6)

## අවශ්‍යතා

- Node v18+, local MongoDB (`mongod`)
- `npm i -g @anthropic-ai/claude-code`
- `server/.env` එකේ: `ANTHROPIC_API_KEY`, `MONGODB_URI`
- Model: **`claude-sonnet-4-6`** (පුරාවටම)

## Live එකේ install කරන deps
```bash
# server/
npm i express cors mongoose dotenv @anthropic-ai/sdk express-rate-limit
npm i -D nodemon
# client/  (Vite scaffold එකෙන් පස්සේ)
npm i   # react, react-dom + tailwind, postcss, autoprefixer
```

> **සටහන:** Live build එක එක API key එකකින් (ANTHROPIC) වැඩ කරන්න retrieval එක
> **lexical (keyword overlap)** විදිහට කරනවා. Production එකේ embeddings + cosine
> similarity වලට මාරු වෙනවා (presentation-guide.html · Section 3 · Slides 16–18).

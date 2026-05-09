# Day 07 — Databases & MongoDB 🍃🔌

**Session 6 — AcademyDSJ MERN + AI Course**
Date: 2026-05-09 (Saturday)

Day 06 walin api Tasks API ekak hadua **in-memory** store eken. Server restart karaddi tasks ටික නැති වෙනවා. Today api eka MongoDB walin replace karala data **persist** karanawa. React frontend ekath connect karala — **MERN stack complete**! 🎉

---

## 📁 Folder Structure

```
day07/
├── README.md                       ← මේ file එක
├── examples/                       ← Mongo concept examples
│   ├── 01-mongoose-connect.js      ← Connect to MongoDB
│   ├── 02-schema-and-model.js      ← Schema + Model define karana hati
│   ├── 03-crud-operations.js       ← create / find / update / delete
│   └── 04-validation-and-queries.js ← Validators + query filters
├── tasks-api/                      ← Day 06's API + MongoDB
│   ├── server.js                   ← Express + Mongoose connect
│   ├── config/db.js                ← Mongoose connection logic
│   ├── models/Task.js              ← Schema + Model
│   ├── routes/tasks.js             ← CRUD routes (Mongoose)
│   ├── middleware/logger.js        ← Same as day 06
│   ├── middleware/errorHandler.js  ← Same as day 06
│   ├── .env / .env.example / .gitignore
│   ├── package.json
│   └── postman-collection.json     ← Import to Postman
└── client/                         ← React frontend (MERN's "R")
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/{main.jsx, App.jsx, api.js}
```

---

## 🎯 Today's Running Order (90 min core + 30 min Q&A)

| # | Mins | Topic | Files |
|---|------|-------|-------|
| 1 | 10 | Recap day 06 + why we need a database | — |
| 2 | 10 | MongoDB Atlas signup OR local install | — |
| 3 | 15 | `examples/01` → `04` walkthrough | `examples/*.js` |
| 4 | 15 | Tasks API ekata Mongoose connect karanawa | `tasks-api/config/db.js`, `models/Task.js` |
| 5 | 15 | Routes — Mongoose CRUD walin re-write | `tasks-api/routes/tasks.js` |
| 6 | 10 | **Postman walkthrough** — 9 requests | `postman-collection.json` |
| 7 | 15 | React frontend — Tasks API call karanawa | `client/src/{App.jsx, api.js}` |
| 8 | 30 | Q&A + homework brief | — |

---

## 1️⃣ MongoDB Setup

### Option A — MongoDB Atlas (cloud, free 512MB) — RECOMMENDED for class

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create cluster → "M0 Free"
3. **Database Access** → Add user `mernuser` + strong password
4. **Network Access** → "Allow Access from Anywhere" (0.0.0.0/0)
5. **Connect → Drivers** → copy connection string:
   ```
   mongodb+srv://mernuser:<password>@cluster0.xxxxx.mongodb.net/day07tasks?retryWrites=true&w=majority
   ```

### Option B — Local Mongo (faster — no internet needed)

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Connection string:
# mongodb://localhost:27017/day07tasks
```

### Visual tool — MongoDB Compass

Download: https://www.mongodb.com/products/compass — paste connection string → see your data live ✨

---

## 2️⃣ Examples — eka eka run karala balanna

```bash
cd examples
npm install mongoose dotenv         # Or use the tasks-api node_modules
node 01-mongoose-connect.js
node 02-schema-and-model.js
node 03-crud-operations.js
node 04-validation-and-queries.js
```

Each file is **self-contained** — connects, runs, disconnects. Great for explaining one concept at a time.

> **Tip:** Open MongoDB Compass beside the terminal — refresh after each run to see records appear/disappear.

---

## 3️⃣ Tasks API — Quick Start

```bash
cd tasks-api
cp .env.example .env                # Edit MONGO_URI inside
npm install                          # express, mongoose, cors, dotenv
npm run dev                          # nodemon → auto restart on save
```

You should see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MongoDB connected: day07tasks
✅ Tasks API running at http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Test from terminal:
```bash
curl http://localhost:3000/tasks
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Mongoose","priority":"high"}'
```

---

## 4️⃣ Postman Collection

**Import:** `tasks-api/postman-collection.json` → 9 requests:

| # | Method | Endpoint | Note |
|---|--------|----------|------|
| 1 | GET    | `/`                | API info |
| 2 | GET    | `/health`          | Uptime check |
| 3 | POST   | `/tasks`           | Create — auto-saves `taskId` |
| 4 | GET    | `/tasks`           | List all |
| 5 | GET    | `/tasks?priority=high` | Filter by priority |
| 6 | GET    | `/tasks/:id`       | Get one |
| 7 | PUT    | `/tasks/:id`       | Mark done: `{"completed":true}` |
| 8 | DELETE | `/tasks/:id`       | Remove |
| 9 | POST   | `/tasks` (no title) | **Should 400** — validation demo |

> **Live demo flow:** Run 3 → 4 → open Compass, point at the new doc → 7 → 4 → 8.

---

## 5️⃣ React Frontend — MERN complete

```bash
cd ../client
npm install
npm run dev                         # http://localhost:5173
```

Make sure `tasks-api` is running on port 3000 first. Frontend calls `http://localhost:3000/tasks` via axios. Add task → see it appear immediately. Toggle done → check Mongo Compass — `completed` flips ✨.

---

## 🤔 Common Questions

**Q: Why Mongoose, not the raw MongoDB driver?**
- Schema validation
- Default values, timestamps
- Middleware (pre-save hooks)
- Cleaner `.find()` / `.findById()` API
- TypeScript types if you upgrade later

**Q: POST returning 400 with empty body?**
A: Forgot `app.use(express.json())`. Without it `req.body === undefined`.

**Q: CORS error in browser console?**
A: Server didn't allow the React origin. Use `app.use(cors({ origin: 'http://localhost:5173' }))`.

**Q: Atlas connect timeout?**
A: IP allowlist — re-add `0.0.0.0/0` in Network Access. Wait 1 min for DNS.

**Q: SQL vs NoSQL in one line?**
- **SQL** = strict tables + rows + joins. Best for: financial, transactional, fixed schemas.
- **NoSQL** = flexible documents (JSON). Best for: evolving data, content, prototypes, MERN apps.

---

## 📚 Homework — Submit by next Saturday

Tasks app extend karanna. Pick **two** of:

1. **Add `dueDate` field** — Mongoose validator: not in past. Show overdue tasks in red.
2. **Add `tags: [String]`** — multi-tag filter dropdown on UI.
3. **Add search** — `GET /tasks?q=word` with case-insensitive regex on title.
4. **Add pagination** — `GET /tasks?page=1&limit=10` with `total` in response.
5. **Deploy** — Backend → Render free tier, Frontend → Vercel. Submit live URL.

Best 3 submissions get **bonus loyalty points** 🏆

---

## 🔗 Useful Links

- Mongoose docs: https://mongoosejs.com/docs/guide.html
- MongoDB Compass: https://www.mongodb.com/products/compass
- Atlas free tier: https://www.mongodb.com/cloud/atlas/register
- Postman download: https://www.postman.com/downloads/

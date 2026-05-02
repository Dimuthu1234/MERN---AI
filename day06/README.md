# Day 06 — Node.js + Express 🟢🚂

**Session 5 — AcademyDSJ MERN + AI Course**
Date: 2026-05-02 (Saturday)

Welcome to your first backend! This folder contains everything for today's class.

---

## 📁 Folder Structure

```
day06/
├── README.md                 ← මේ file එක
├── examples/                 ← Step-by-step concept examples
│   ├── 01-hello-server.js    ← First Express server (4 routes)
│   ├── 02-routes-and-params.js  ← params, query, body, headers
│   ├── 03-middleware.js      ← Logger + auth middleware
│   └── 04-rest-api-inmemory.js  ← Single-file Tasks API
└── tasks-api/                ← Production-style Tasks REST API
    ├── server.js             ← Entry point
    ├── routes/tasks.js       ← All /tasks endpoints
    ├── middleware/           ← logger, errorHandler
    ├── data/tasks.js         ← In-memory data store
    ├── .env                  ← Environment variables
    ├── .env.example          ← Template for .env
    ├── .gitignore            ← node_modules, .env
    ├── package.json          ← Dependencies + scripts
    └── postman-collection.json  ← Import into Postman
```

---

## 🚀 Quick Start — Tasks API

```bash
cd tasks-api
npm install        # Downloads express, cors, dotenv, nodemon
npm run dev        # Starts server with auto-restart
```

You should see:
```
✅ Tasks API running at http://localhost:3000
```

Open browser → http://localhost:3000 → JSON response with endpoint list.

---

## 🔌 Postman Setup — 60 Seconds

1. **Install Postman** → https://www.postman.com/downloads/
2. **Import the collection:**
   - Open Postman
   - Click **Import** (top-left)
   - Drag `tasks-api/postman-collection.json` into the dialog
   - Click **Import**
3. **You'll see "Tasks API — Day 06"** in your sidebar with 15 ready requests:
   - `00 — API Info` & `Health Check`
   - `01 — Get All Tasks`
   - `02-04 — Filter requests` (completed, priority)
   - `05-06 — Get one task` (success + 404)
   - `07-09 — Create` (valid + validation errors)
   - `10-11 — Update task`
   - `12-13 — Delete task` (success + 404)
   - `14 — Unknown route` (404 handler)
4. **Click any request → click Send** → see the response!

> 💡 The base URL `{{baseUrl}}` is set to `http://localhost:3000` via collection variable. Easy to change for staging/production.

---

## 📚 Examples — Run individually

Each `examples/*.js` is standalone — no `npm install` needed if Express is already installed somewhere:

```bash
cd examples
# Use the express from tasks-api/node_modules (or install globally):
NODE_PATH=../tasks-api/node_modules node 01-hello-server.js
```

OR install express in the examples folder:
```bash
cd examples
npm init -y
npm install express
node 01-hello-server.js
```

| File | What it teaches |
|---|---|
| `01-hello-server.js` | First server, `app.get`, `res.send`, `res.json`, status codes, URL params |
| `02-routes-and-params.js` | `req.params`, `req.query`, `req.body`, `req.headers`, all 4 methods |
| `03-middleware.js` | `app.use` global middleware, route-level middleware, 404 + error handlers |
| `04-rest-api-inmemory.js` | Full CRUD Tasks API in single file (matches the slides exactly) |

---

## 🎯 Live Session Plan

1. **Examples 01-03** — Walk through each as concept demo (~10 min each)
2. **Example 04** — Live code from scratch in front of class
3. **tasks-api/ project** — Show how to split into folders for real apps
4. **Postman collection** — Demo every endpoint live

---

## 🏆 Today's Assignments (LMS)

4 graded assignments are live in the LMS:
- Hello Express Server (beginner)
- Books REST API (beginner)
- Logger + Auth Middleware (intermediate)
- Tasks API with Validation (intermediate)

Open: https://academydsj.com/lms

---

## 🐛 Common Issues

| Problem | Fix |
|---|---|
| `EADDRINUSE :3000` | Change PORT in `.env` or kill the other process: `lsof -i :3000` |
| `Cannot find module 'express'` | Run `npm install` in `tasks-api/` |
| `req.body is undefined` | Make sure `app.use(express.json())` is BEFORE the route |
| CORS error from React | We already added `app.use(cors())` ✅ |
| Postman can't reach localhost | Make sure server is running (check terminal) |

---

## 🔮 Next Week — Day 07

Replace the in-memory `data/tasks.js` with **SQLite** so data survives server restarts. Then connect a React frontend and become a full-stack developer! 🚀

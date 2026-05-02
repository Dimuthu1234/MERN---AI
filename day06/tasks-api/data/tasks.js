// In-memory task storage.
// Next session (Day 07) — replace this with SQLite for persistence.

let tasks = [
  { id: 1, title: 'Setup Node.js + Express', completed: true,  priority: 'high'   },
  { id: 2, title: 'Build first REST API',    completed: true,  priority: 'high'   },
  { id: 3, title: 'Add validation',          completed: false, priority: 'high'   },
  { id: 4, title: 'Add custom middleware',   completed: false, priority: 'medium' },
  { id: 5, title: 'Connect React frontend',  completed: false, priority: 'low'    }
];
let nextId = 6;

module.exports = {
  getAll: () => tasks,

  getById: (id) => tasks.find(t => t.id == id),

  create: (data) => {
    const task = {
      id: nextId++,
      title: data.title.trim(),
      completed: false,
      priority: data.priority || 'medium'
    };
    tasks.push(task);
    return task;
  },

  update: (id, data) => {
    const task = tasks.find(t => t.id == id);
    if (!task) return null;
    Object.assign(task, data, { id: task.id }); // protect id
    return task;
  },

  remove: (id) => {
    const before = tasks.length;
    tasks = tasks.filter(t => t.id != id);
    return tasks.length < before;
  },

  filter: (predicate) => tasks.filter(predicate)
};

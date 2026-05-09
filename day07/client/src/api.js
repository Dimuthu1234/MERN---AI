// Axios wrapper around tasks-api
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const TasksAPI = {
  list:   ()        => api.get('/tasks').then(r => r.data),
  create: (data)    => api.post('/tasks', data).then(r => r.data),
  update: (id, p)   => api.put(`/tasks/${id}`, p).then(r => r.data),
  remove: (id)      => api.delete(`/tasks/${id}`).then(r => r.data),
};

import { request } from './client.js';

/** Points d'accès de l'API Kanban utilisés par l'interface. */
export const kanbanApi = {
  getBoard: (signal) => request('/board', { signal }),
  createTask: (task) => request('/tasks', { method: 'POST', body: task }),
  updateTask: (id, changes) =>
    request(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes }),
  deleteTask: (id) => request(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

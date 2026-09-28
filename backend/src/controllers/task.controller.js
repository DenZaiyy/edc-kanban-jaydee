'use strict';

const taskService = require('../services/task.service');

/**
 * Contrôleurs HTTP des tâches : ils traduisent la requête en appel au service
 * puis le résultat en réponse HTTP. Aucune règle métier ici.
 * Les données (req.params, req.body) ont déjà été validées par le middleware.
 */

/** GET /api/tasks/:id */
function getTask(req, res) {
  res.status(200).json(taskService.getById(req.params.id));
}

/** POST /api/tasks */
function createTask(req, res) {
  const task = taskService.create(req.body);
  res.status(201).location(`${req.baseUrl}/${task.id}`).json(task);
}

/** PATCH /api/tasks/:id — modification partielle, y compris le déplacement (columnId). */
function updateTask(req, res) {
  res.status(200).json(taskService.update(req.params.id, req.body));
}

/** DELETE /api/tasks/:id */
function deleteTask(req, res) {
  taskService.remove(req.params.id);
  res.status(204).end();
}

module.exports = { getTask, createTask, updateTask, deleteTask };

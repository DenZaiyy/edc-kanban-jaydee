'use strict';

const store = require('../data/store');
const Task = require('../models/Task');
const { NotFoundError, ValidationError, ConflictError } = require('../errors/AppError');

/** Récupère une tâche ou lève une erreur 404. */
function findTaskOrFail(id) {
  const task = store.findTask(id);
  if (!task) {
    throw new NotFoundError(`La tâche « ${id} » est introuvable.`);
  }
  return task;
}

/** Vérifie que la colonne visée existe (règle de cohérence des données). */
function findColumnOrFail(columnId) {
  const column = store.findColumn(columnId);
  if (!column) {
    throw new ValidationError('Les données envoyées sont invalides.', [
      { location: 'body', field: 'columnId', message: `La colonne « ${columnId} » n'existe pas.` },
    ]);
  }
  return column;
}

/** Règle métier Kanban : on ne dépasse pas la limite de tâches d'une colonne. */
function assertColumnCanAcceptTask(column) {
  if (!column.canAccept(store.countTasksInColumn(column.id))) {
    throw new ConflictError(
      `La colonne « ${column.title} » a atteint sa limite de ${column.wipLimit} tâches.`,
    );
  }
}

/**
 * Logique métier liée aux tâches. Les services ne connaissent pas HTTP :
 * ils reçoivent des données déjà validées et lèvent des erreurs métier.
 */
const taskService = {
  getById(id) {
    return findTaskOrFail(id).toJSON();
  },

  create({ name, description, color, columnId }) {
    const column = findColumnOrFail(columnId);
    assertColumnCanAcceptTask(column);

    const task = new Task({ id: store.nextTaskId(), name, description, color, columnId });
    return store.saveTask(task).toJSON();
  },

  update(id, changes) {
    const current = findTaskOrFail(id);

    const isMove = changes.columnId !== undefined && changes.columnId !== current.columnId;
    if (isMove) {
      assertColumnCanAcceptTask(findColumnOrFail(changes.columnId));
    }

    return store.saveTask(current.update(changes)).toJSON();
  },

  remove(id) {
    findTaskOrFail(id);
    store.deleteTask(id);
  },
};

module.exports = taskService;

'use strict';

const Column = require('../models/Column');
const Task = require('../models/Task');
const seed = require('./seed');

/**
 * Stockage en mémoire des colonnes et des tâches (version 1 de l'application).
 * Toute la persistance est isolée dans ce module : il pourra être remplacé
 * par une base de données (PostgreSQL…) sans modifier les services ni les routes.
 */
const state = {
  columns: [],
  tasks: new Map(),
  lastTaskNumber: 0,
};

const taskNumber = (id) => Number.parseInt(id.replace('task-', ''), 10) || 0;

/** (Ré)initialise le stockage à partir du jeu de démonstration. */
function reset() {
  // Les constructeurs des modèles vérifient la cohérence de chaque objet créé.
  state.columns = seed.columns
    .map((data) => new Column(data))
    .sort((a, b) => a.position - b.position);

  const columnIds = new Set(state.columns.map((column) => column.id));
  state.tasks = new Map();
  for (const data of seed.tasks) {
    const task = new Task(data);
    if (!columnIds.has(task.columnId)) {
      throw new Error(`Jeu de démonstration incohérent : colonne « ${task.columnId} » inconnue.`);
    }
    if (state.tasks.has(task.id)) {
      throw new Error(`Jeu de démonstration incohérent : identifiant « ${task.id} » en double.`);
    }
    state.tasks.set(task.id, task);
  }

  state.lastTaskNumber = Math.max(0, ...[...state.tasks.keys()].map(taskNumber));
}

const store = {
  reset,

  getColumns: () => [...state.columns],
  findColumn: (id) => state.columns.find((column) => column.id === id) ?? null,

  getTasks: () => [...state.tasks.values()],
  findTask: (id) => state.tasks.get(id) ?? null,
  countTasksInColumn: (columnId) =>
    [...state.tasks.values()].filter((task) => task.columnId === columnId).length,

  nextTaskId: () => {
    state.lastTaskNumber += 1;
    return `task-${state.lastTaskNumber}`;
  },
  saveTask: (task) => {
    state.tasks.set(task.id, task);
    return task;
  },
  deleteTask: (id) => state.tasks.delete(id),
};

reset();

module.exports = store;

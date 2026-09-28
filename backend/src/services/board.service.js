'use strict';

const store = require('../data/store');

/**
 * Construit la vue « tableau » : les colonnes dans l'ordre d'affichage,
 * chacune avec ses tâches. Format directement exploitable par le front-end.
 */
const boardService = {
  getBoard() {
    const tasks = store.getTasks();

    return {
      columns: store.getColumns().map((column) => ({
        ...column.toJSON(),
        tasks: tasks.filter((task) => task.columnId === column.id).map((task) => task.toJSON()),
      })),
    };
  },
};

module.exports = boardService;

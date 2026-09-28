'use strict';

const boardService = require('../services/board.service');

/** GET /api/board — colonnes et tâches du tableau. */
function getBoard(req, res) {
  res.status(200).json(boardService.getBoard());
}

module.exports = { getBoard };

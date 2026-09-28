'use strict';

const { Router } = require('express');
const boardController = require('../controllers/board.controller');

const router = Router();

// GET /api/board : liste des colonnes, chacune avec ses tâches
router.get('/', boardController.getBoard);

module.exports = router;

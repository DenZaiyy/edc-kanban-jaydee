'use strict';

const { Router } = require('express');
const healthRoutes = require('./health.routes');
const boardRoutes = require('./board.routes');
const taskRoutes = require('./task.routes');

/** Point d'entrée de l'API, monté sur /api. */
const router = Router();

router.use('/health', healthRoutes);
router.use('/board', boardRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;

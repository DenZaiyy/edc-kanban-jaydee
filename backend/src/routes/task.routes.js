'use strict';

const { Router } = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middlewares/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamsSchema,
} = require('../validators/task.schemas');

const router = Router();

// La validation s'exécute avant le contrôleur, et donc avant toute logique métier.
router.post('/', validate({ body: createTaskSchema }), taskController.createTask);
router.get('/:id', validate({ params: taskIdParamsSchema }), taskController.getTask);
router.patch(
  '/:id',
  validate({ params: taskIdParamsSchema, body: updateTaskSchema }),
  taskController.updateTask,
);
router.delete('/:id', validate({ params: taskIdParamsSchema }), taskController.deleteTask);

module.exports = router;

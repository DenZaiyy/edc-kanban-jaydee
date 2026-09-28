'use strict';

/**
 * Règles métier partagées entre les modèles et les schémas de validation,
 * pour qu'une même règle ne soit définie qu'à un seul endroit.
 */

/** Palette de couleurs autorisées pour une tâche (étiquette visuelle). */
const TASK_COLORS = Object.freeze(['blue', 'green', 'orange', 'red', 'purple', 'grey']);

const TASK_RULES = Object.freeze({
  nameMaxLength: 120,
  descriptionMaxLength: 500,
});

/** Format des identifiants de tâche générés par l'application : task-1, task-2… */
const TASK_ID_PATTERN = /^task-\d+$/;

module.exports = { TASK_COLORS, TASK_RULES, TASK_ID_PATTERN };

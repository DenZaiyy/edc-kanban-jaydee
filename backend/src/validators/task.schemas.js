'use strict';

const { z } = require('./zod');
const { TASK_COLORS, TASK_RULES, TASK_ID_PATTERN } = require('../models/constants');

/**
 * Schémas de validation des requêtes sur les tâches.
 * Ils contrôlent la présence des champs obligatoires, leur type et leurs valeurs,
 * et refusent tout champ non prévu (id, createdAt…) pour empêcher le client
 * de modifier des données qu'il ne doit pas contrôler (« mass assignment »).
 */

/** Message différent selon que le champ est absent ou d'un mauvais type. */
const requiredString = (missingMessage, typeMessage) =>
  z.string({ error: (issue) => (issue.input === undefined ? missingMessage : typeMessage) });

const unknownFields = {
  error: (issue) =>
    issue.code === 'unrecognized_keys'
      ? `Champ(s) non autorisé(s) : ${issue.keys.join(', ')}.`
      : undefined,
};

const name = requiredString('Le nom est obligatoire.', 'Le nom doit être un texte.')
  .trim()
  .min(1, 'Le nom est obligatoire.')
  .max(
    TASK_RULES.nameMaxLength,
    `Le nom ne doit pas dépasser ${TASK_RULES.nameMaxLength} caractères.`,
  );

const description = z
  .string({ error: 'La description doit être un texte.' })
  .trim()
  .max(
    TASK_RULES.descriptionMaxLength,
    `La description ne doit pas dépasser ${TASK_RULES.descriptionMaxLength} caractères.`,
  );

const color = z.enum(TASK_COLORS, {
  error: (issue) =>
    issue.input === undefined
      ? 'La couleur est obligatoire.'
      : `La couleur doit être l'une des valeurs suivantes : ${TASK_COLORS.join(', ')}.`,
});

const columnId = requiredString(
  'La colonne est obligatoire.',
  "L'identifiant de colonne doit être un texte.",
)
  .trim()
  .min(1, 'La colonne est obligatoire.')
  .max(50, "L'identifiant de colonne est trop long.");

/** POST /api/tasks */
const createTaskSchema = z.strictObject(
  { name, description: description.optional(), color, columnId },
  unknownFields,
);

/** PATCH /api/tasks/:id — tous les champs sont facultatifs, mais au moins un est requis. */
const updateTaskSchema = z
  .strictObject(
    {
      name: name.optional(),
      description: description.optional(),
      color: color.optional(),
      columnId: columnId.optional(),
    },
    unknownFields,
  )
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Au moins un champ à modifier doit être fourni (name, description, color ou columnId).',
  });

/** Paramètre :id des routes /api/tasks/:id */
const taskIdParamsSchema = z.strictObject({
  id: z
    .string()
    .regex(TASK_ID_PATTERN, "L'identifiant de tâche est invalide (format attendu : task-123)."),
});

module.exports = { createTaskSchema, updateTaskSchema, taskIdParamsSchema };

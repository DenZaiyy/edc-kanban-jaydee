'use strict';

const { ValidationError } = require('../errors/AppError');
const { TASK_COLORS, TASK_RULES } = require('./constants');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const toValidDate = (value) => {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Tâche du tableau Kanban (une étape d'un ordre de fabrication).
 * L'objet est immuable : toute modification produit une nouvelle instance
 * dont les invariants sont de nouveau vérifiés. Il est donc impossible
 * d'obtenir une tâche incomplète ou incohérente.
 */
class Task {
  /**
   * @param {object} props
   * @param {string} props.id          Identifiant unique (ex. "task-1")
   * @param {string} props.name        Nom de la tâche
   * @param {string} [props.description] Détail facultatif
   * @param {string} props.color       Couleur parmi TASK_COLORS
   * @param {string} props.columnId    Colonne dans laquelle se trouve la tâche
   * @param {Date|string} [props.createdAt]
   * @param {Date|string} [props.updatedAt]
   */
  constructor({
    id,
    name,
    description = '',
    color,
    columnId,
    createdAt = new Date(),
    updatedAt = createdAt,
  }) {
    const errors = [];

    if (!isNonEmptyString(id)) {
      errors.push({ field: 'id', message: "L'identifiant de la tâche est obligatoire." });
    }

    if (!isNonEmptyString(name)) {
      errors.push({ field: 'name', message: 'Le nom de la tâche est obligatoire.' });
    } else if (name.trim().length > TASK_RULES.nameMaxLength) {
      errors.push({
        field: 'name',
        message: `Le nom ne doit pas dépasser ${TASK_RULES.nameMaxLength} caractères.`,
      });
    }

    if (typeof description !== 'string') {
      errors.push({ field: 'description', message: 'La description doit être un texte.' });
    } else if (description.trim().length > TASK_RULES.descriptionMaxLength) {
      errors.push({
        field: 'description',
        message: `La description ne doit pas dépasser ${TASK_RULES.descriptionMaxLength} caractères.`,
      });
    }

    if (!TASK_COLORS.includes(color)) {
      errors.push({
        field: 'color',
        message: `La couleur doit être l'une des valeurs suivantes : ${TASK_COLORS.join(', ')}.`,
      });
    }

    if (!isNonEmptyString(columnId)) {
      errors.push({ field: 'columnId', message: 'La colonne de la tâche est obligatoire.' });
    }

    const created = toValidDate(createdAt);
    const updated = toValidDate(updatedAt);
    if (!created || !updated) {
      errors.push({
        field: 'dates',
        message: 'Les dates de création et de modification sont invalides.',
      });
    } else if (updated < created) {
      errors.push({
        field: 'updatedAt',
        message: 'La date de modification ne peut pas précéder la date de création.',
      });
    }

    if (errors.length > 0) {
      throw new ValidationError('Tâche invalide.', errors);
    }

    this.id = id;
    this.name = name.trim();
    this.description = description.trim();
    this.color = color;
    this.columnId = columnId;
    this.createdAt = created;
    this.updatedAt = updated;
    Object.freeze(this);
  }

  /**
   * Renvoie une nouvelle tâche intégrant les modifications demandées.
   * L'identifiant et la date de création ne peuvent pas être modifiés.
   * @param {object} changes Champs modifiables : name, description, color, columnId
   * @param {Date} [now] Date de modification (injectable pour les tests)
   */
  update(changes, now = new Date()) {
    return new Task({
      ...this,
      ...changes,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: now,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      columnId: this.columnId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

module.exports = Task;

'use strict';

const { ValidationError } = require('../errors/AppError');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

/**
 * Colonne du tableau Kanban : une étape du processus de production
 * (À faire, En cours, À contrôler, Terminé).
 * L'objet est immuable et ses invariants sont vérifiés à la construction.
 */
class Column {
  /**
   * @param {object} props
   * @param {string} props.id        Identifiant technique (ex. "in-progress")
   * @param {string} props.title     Libellé affiché (ex. "En cours")
   * @param {number} props.position  Ordre d'affichage, à partir de 1
   * @param {number|null} [props.wipLimit] Nombre maximal de tâches (null = illimité)
   */
  constructor({ id, title, position, wipLimit = null }) {
    const errors = [];

    if (!isNonEmptyString(id)) {
      errors.push({ field: 'id', message: "L'identifiant de la colonne est obligatoire." });
    }
    if (!isNonEmptyString(title)) {
      errors.push({ field: 'title', message: 'Le titre de la colonne est obligatoire.' });
    }
    if (!isPositiveInteger(position)) {
      errors.push({ field: 'position', message: 'La position doit être un entier positif.' });
    }
    if (wipLimit !== null && !isPositiveInteger(wipLimit)) {
      errors.push({ field: 'wipLimit', message: 'La limite doit être un entier positif ou null.' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Colonne invalide.', errors);
    }

    this.id = id;
    this.title = title.trim();
    this.position = position;
    this.wipLimit = wipLimit;
    Object.freeze(this);
  }

  /**
   * Règle métier Kanban : une colonne limitée ne peut pas accueillir
   * plus de tâches que sa limite (WIP limit).
   * @param {number} currentTaskCount Nombre de tâches déjà présentes dans la colonne
   */
  canAccept(currentTaskCount) {
    return this.wipLimit === null || currentTaskCount < this.wipLimit;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      position: this.position,
      wipLimit: this.wipLimit,
    };
  }
}

module.exports = Column;

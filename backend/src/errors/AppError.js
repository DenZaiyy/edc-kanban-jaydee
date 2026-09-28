'use strict';

/**
 * Erreur applicative « attendue » : son statut HTTP, son code et son message
 * sont conçus pour être renvoyés tels quels au client.
 * Toute autre erreur est considérée comme inattendue (statut 500, message générique).
 */
class AppError extends Error {
  constructor(statusCode, code, message, details = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/** 400 : données reçues absentes, mal typées ou incohérentes. */
class ValidationError extends AppError {
  constructor(message = 'Les données envoyées sont invalides.', details = []) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

/** 404 : ressource ou route inexistante. */
class NotFoundError extends AppError {
  constructor(message = 'La ressource demandée est introuvable.') {
    super(404, 'NOT_FOUND', message);
  }
}

/** 409 : l'opération viole une règle métier (ex. limite de tâches d'une colonne). */
class ConflictError extends AppError {
  constructor(message) {
    super(409, 'CONFLICT', message);
  }
}

/** 429 : trop de requêtes envoyées sur la période. */
class TooManyRequestsError extends AppError {
  constructor(message = 'Trop de requêtes. Veuillez réessayer dans quelques minutes.') {
    super(429, 'TOO_MANY_REQUESTS', message);
  }
}

/** 415 : le corps de la requête n'est pas au format JSON attendu. */
class UnsupportedMediaTypeError extends AppError {
  constructor(
    message = 'Le corps de la requête doit être au format JSON (Content-Type: application/json).',
  ) {
    super(415, 'UNSUPPORTED_MEDIA_TYPE', message);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  UnsupportedMediaTypeError,
};

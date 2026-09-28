'use strict';

const { AppError } = require('../errors/AppError');
const logger = require('../utils/logger');

/** Erreurs levées par express.json() pour un corps de requête incorrect. */
const BODY_PARSER_ERRORS = {
  'entity.parse.failed': {
    code: 'INVALID_JSON',
    message: "Le corps de la requête n'est pas un JSON valide.",
  },
  'entity.too.large': {
    code: 'PAYLOAD_TOO_LARGE',
    message: 'Le corps de la requête est trop volumineux.',
  },
};

const sendError = (res, status, code, message, details) =>
  res.status(status).json({
    error: { code, message, ...(details?.length > 0 && { details }) },
  });

/**
 * Gestionnaire d'erreurs centralisé (dernier middleware de l'application).
 * - Erreur applicative (AppError) : statut, code et message prévus pour le client.
 * - Erreur de requête (JSON mal formé, corps trop gros…) : statut 4xx explicite.
 * - Toute autre erreur : journalisée côté serveur, et réponse 500 générique
 *   SANS message technique ni stack trace, pour ne rien exposer au client.
 *
 * Express reconnaît un gestionnaire d'erreurs à ses 4 paramètres.
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    // La réponse a déjà commencé : on laisse Express fermer la connexion.
    return next(err);
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  const isClientError = Number.isInteger(err.status) && err.status >= 400 && err.status < 500;
  if (isClientError) {
    const known = BODY_PARSER_ERRORS[err.type] ?? {
      code: 'BAD_REQUEST',
      message: 'Requête invalide.',
    };
    return sendError(res, err.status, known.code, known.message);
  }

  logger.error(`Erreur inattendue sur ${req.method} ${req.originalUrl}`, err);
  return sendError(
    res,
    500,
    'INTERNAL_ERROR',
    'Une erreur interne est survenue. Veuillez réessayer plus tard.',
  );
}

module.exports = errorHandler;

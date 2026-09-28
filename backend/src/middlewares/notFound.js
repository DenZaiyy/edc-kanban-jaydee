'use strict';

const { NotFoundError } = require('../errors/AppError');

/** Toute requête qui n'a correspondu à aucune route aboutit ici. */
function notFound(req, res, next) {
  next(new NotFoundError("La route demandée n'existe pas."));
}

module.exports = notFound;

'use strict';

const { UnsupportedMediaTypeError } = require('../errors/AppError');

/**
 * Refuse (415) toute requête dont le corps n'est pas du JSON.
 * req.is() renvoie null quand la requête n'a pas de corps : ces requêtes passent.
 */
function requireJson(req, res, next) {
  if (req.is('application/json') === false) {
    return next(new UnsupportedMediaTypeError());
  }
  return next();
}

module.exports = requireJson;

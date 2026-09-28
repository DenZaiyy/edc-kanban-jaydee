'use strict';

const { ValidationError } = require('../errors/AppError');

const LOCATIONS = ['params', 'query', 'body'];

const formatIssue = (location, issue) => ({
  location,
  field: issue.code === 'unrecognized_keys' ? issue.keys.join(', ') : issue.path.join('.') || null,
  message: issue.message,
});

/**
 * Middleware de validation générique, réutilisé par toutes les routes.
 * Il valide req.params, req.query et/ou req.body avec les schémas fournis
 * AVANT l'exécution du contrôleur : la logique métier ne reçoit que des données valides.
 *
 * @example router.post('/', validate({ body: createTaskSchema }), createTask)
 * @param {{ params?: import('zod').ZodType, query?: import('zod').ZodType, body?: import('zod').ZodType }} schemas
 */
function validate(schemas) {
  return (req, res, next) => {
    const details = [];

    for (const location of LOCATIONS) {
      const schema = schemas[location];
      if (!schema) continue;

      // Depuis Express 5, req.body vaut undefined si aucun corps n'a été envoyé.
      const result = schema.safeParse(req[location] ?? {});

      if (!result.success) {
        details.push(...result.error.issues.map((issue) => formatIssue(location, issue)));
      } else if (location === 'body') {
        // Le contrôleur reçoit les données nettoyées (espaces supprimés, champs contrôlés).
        req.body = result.data;
      }
    }

    if (details.length > 0) {
      return next(new ValidationError('Les données envoyées sont invalides.', details));
    }
    return next();
  };
}

module.exports = validate;

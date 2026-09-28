'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

const config = require('./config');
const apiRouter = require('./routes');
const requireJson = require('./middlewares/requireJson');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { TooManyRequestsError } = require('./errors/AppError');

/**
 * Construit l'application Express sans la démarrer.
 * server.js la met en écoute ; les tests l'utilisent directement avec supertest.
 */
function createApp() {
  const app = express();

  // Derrière un reverse proxy, adresse IP réelle du client (voir config.trustProxy).
  app.set('trust proxy', config.trustProxy);

  // En-têtes de sécurité HTTP (nosniff, frameguard, CSP…) et suppression de X-Powered-By.
  app.use(helmet());

  // Seul le front-end autorisé peut appeler l'API depuis un navigateur.
  app.use(
    cors({
      origin: config.corsOrigin,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type'],
    }),
  );

  // Limitation du nombre de requêtes par adresse IP (abus, scripts en boucle).
  app.use(
    '/api',
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      limit: config.rateLimit.limit,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (req, res, next) => next(new TooManyRequestsError()),
    }),
  );

  // Corps de requête accepté uniquement en JSON (415 sinon), avec une taille limitée (413).
  app.use('/api', requireJson);
  app.use(express.json({ limit: config.bodyLimit }));

  app.use('/api', apiRouter);

  // Routes inconnues, puis gestion centralisée de toutes les erreurs.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

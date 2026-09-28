'use strict';

const config = require('./config');
const { createApp } = require('./app');
const logger = require('./utils/logger');

const app = createApp();

const server = app.listen(config.port, (error) => {
  if (error) {
    logger.error(`Impossible de démarrer le serveur sur le port ${config.port}`, error);
    process.exit(1);
  }
  logger.info(`API Kanban Jaydee démarrée sur http://localhost:${config.port} (${config.env})`);
});

// Arrêt propre : on termine les requêtes en cours avant de quitter.
const shutdown = (signal) => {
  logger.info(`Signal ${signal} reçu, arrêt du serveur…`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

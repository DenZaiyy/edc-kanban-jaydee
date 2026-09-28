'use strict';

/**
 * Journalisation minimale côté serveur.
 * Désactivée pendant les tests pour garder une sortie lisible.
 */
const isSilent = process.env.NODE_ENV === 'test';

const timestamp = () => new Date().toISOString();

const logger = {
  info(message) {
    if (!isSilent) console.log(`[${timestamp()}] INFO  ${message}`);
  },
  error(message, error) {
    if (!isSilent) console.error(`[${timestamp()}] ERROR ${message}`, error ?? '');
  },
};

module.exports = logger;

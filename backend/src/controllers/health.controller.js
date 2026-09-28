'use strict';

/** GET /api/health — vérifie que l'API répond (test de la chaîne front ↔ back). */
function getHealth(req, res) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}

module.exports = { getHealth };

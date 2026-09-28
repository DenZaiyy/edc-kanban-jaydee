'use strict';

const { z } = require('zod');

// Messages d'erreur par défaut de Zod en français (les messages métier sont personnalisés).
z.config(z.locales.fr());

module.exports = { z };

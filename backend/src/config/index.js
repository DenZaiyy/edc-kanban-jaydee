'use strict';

/**
 * Configuration centralisée, lue depuis les variables d'environnement
 * (fichier .env chargé par Node via --env-file-if-exists).
 */

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Réglage « trust proxy » d'Express : derrière le reverse proxy de production,
 * il permet de retrouver l'adresse IP réelle du client (utile à la limitation de débit).
 * Exemples : TRUST_PROXY=1 (un proxy devant l'API), TRUST_PROXY=loopback. Désactivé par défaut.
 */
const toTrustProxy = (value) => {
  if (value === undefined || value === '' || value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
};

const config = Object.freeze({
  env: process.env.NODE_ENV ?? 'development',
  port: toPositiveInt(process.env.PORT, 3000),
  // Seule origine autorisée à appeler l'API depuis un navigateur (front-end React)
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  trustProxy: toTrustProxy(process.env.TRUST_PROXY),
  // Limitation du nombre de requêtes : 300 requêtes par fenêtre de 15 minutes et par IP
  rateLimit: Object.freeze({
    windowMs: 15 * 60 * 1000,
    limit: toPositiveInt(process.env.RATE_LIMIT_MAX, 300),
  }),
  // Taille maximale d'un corps de requête JSON
  bodyLimit: '10kb',
});

module.exports = config;

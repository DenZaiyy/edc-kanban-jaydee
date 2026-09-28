'use strict';

/**
 * Jeu de données de démonstration.
 * Il est volontairement déterministe (identifiants et dates fixes) :
 * chaque démarrage et chaque test repartent exactement du même état,
 * ce qui facilite les tests automatisés et le développement du front-end.
 */

const columns = [
  { id: 'todo', title: 'À faire', position: 1, wipLimit: null },
  { id: 'in-progress', title: 'En cours', position: 2, wipLimit: 4 },
  { id: 'review', title: 'À contrôler', position: 3, wipLimit: 3 },
  { id: 'done', title: 'Terminé', position: 4, wipLimit: null },
];

const tasks = [
  // --- À faire ---
  {
    id: 'task-1',
    name: 'OF-2418 · Préparer le moule capot de rétroviseur',
    description: 'Presse 450 t, série de 2 000 pièces pour le client automobile.',
    color: 'blue',
    columnId: 'todo',
    createdAt: '2026-09-21T06:30:00.000Z',
  },
  {
    id: 'task-2',
    name: 'OF-2421 · Étuver la matière PA66 GF30',
    description: 'Séchage 4 h à 80 °C avant lancement sur la presse 3.',
    color: 'orange',
    columnId: 'todo',
    createdAt: '2026-09-22T07:00:00.000Z',
  },
  {
    id: 'task-3',
    name: 'OF-2425 · Changement de série presse 2',
    description: "Démonter l'outillage bouchon, monter l'outillage clip.",
    color: 'grey',
    columnId: 'todo',
    createdAt: '2026-09-22T09:15:00.000Z',
  },
  {
    id: 'task-4',
    name: 'OF-2427 · Injection corps de seringue',
    description: 'Lot médical en salle blanche, traçabilité matière obligatoire.',
    color: 'green',
    columnId: 'todo',
    createdAt: '2026-09-23T06:45:00.000Z',
  },
  {
    id: 'task-5',
    name: 'OF-2430 · Régler le surmoulage du connecteur',
    color: 'purple',
    columnId: 'todo',
    createdAt: '2026-09-23T13:20:00.000Z',
  },
  {
    id: 'task-6',
    name: 'OF-2433 · Maintenance préventive presse 5',
    description: 'Graissage des colonnes et contrôle du circuit hydraulique.',
    color: 'grey',
    columnId: 'todo',
    createdAt: '2026-09-24T08:00:00.000Z',
  },
  {
    id: 'task-7',
    name: 'OF-2436 · Injection bouchons flacons 30 ml',
    color: 'green',
    columnId: 'todo',
    createdAt: '2026-09-24T14:10:00.000Z',
  },
  // --- En cours ---
  {
    id: 'task-8',
    name: "OF-2409 · Injection carter d'aspirateur",
    description: '1 200 pièces produites sur 3 000.',
    color: 'purple',
    columnId: 'in-progress',
    createdAt: '2026-09-18T06:00:00.000Z',
    updatedAt: '2026-09-25T10:30:00.000Z',
  },
  {
    id: 'task-9',
    name: 'OF-2412 · Injection clips de tableau de bord',
    description: 'Cadence de 480 pièces par heure sur la presse 3.',
    color: 'blue',
    columnId: 'in-progress',
    createdAt: '2026-09-18T08:30:00.000Z',
    updatedAt: '2026-09-24T15:00:00.000Z',
  },
  {
    id: 'task-10',
    name: 'OF-2415 · Surmoulage capteur de pression',
    description: 'Urgent : livraison client avancée à vendredi.',
    color: 'red',
    columnId: 'in-progress',
    createdAt: '2026-09-19T07:10:00.000Z',
    updatedAt: '2026-09-25T07:40:00.000Z',
  },
  // --- À contrôler ---
  {
    id: 'task-11',
    name: 'OF-2401 · Contrôle dimensionnel des capots',
    description: 'Mesure 3D sur 5 pièces du lot n° 12.',
    color: 'blue',
    columnId: 'review',
    createdAt: '2026-09-15T06:30:00.000Z',
    updatedAt: '2026-09-24T09:00:00.000Z',
  },
  {
    id: 'task-12',
    name: 'OF-2404 · Contrôle visuel bouchons flacons',
    color: 'green',
    columnId: 'review',
    createdAt: '2026-09-16T07:45:00.000Z',
    updatedAt: '2026-09-25T08:20:00.000Z',
  },
  // --- Terminé ---
  {
    id: 'task-13',
    name: 'OF-2396 · Livraison poignées de lave-linge',
    description: 'Lot expédié, bon de livraison signé par le client.',
    color: 'purple',
    columnId: 'done',
    createdAt: '2026-09-10T06:00:00.000Z',
    updatedAt: '2026-09-22T16:30:00.000Z',
  },
  {
    id: 'task-14',
    name: 'OF-2393 · Validation du premier article boîtier',
    color: 'grey',
    columnId: 'done',
    createdAt: '2026-09-09T07:30:00.000Z',
    updatedAt: '2026-09-21T11:00:00.000Z',
  },
];

module.exports = { columns, tasks };

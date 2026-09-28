# Jaydee — Application Kanban de production

Étude de cas CDA — Bloc 1 (entraînement). Application web de suivi des ordres de fabrication
sous forme de tableau Kanban, organisée en deux applications distinctes :

| Dossier     | Rôle                                                             | Technologies                                  |
| ----------- | ---------------------------------------------------------------- | --------------------------------------------- |
| `backend/`  | API REST : logique métier, validation, sécurité, gestion d'erreurs | Node.js 22.12+ (24 LTS conseillé), Express 5, Zod, Jest, Supertest |
| `frontend/` | Interface : tableau Kanban responsive (poste fixe et tablette)     | React 19, Vite 8, CSS Modules                  |
| `docs/`     | Maquette (exports Figma) et documents de l'étude de cas            | —                                             |

## Démarrage

Prérequis : Node.js 22.12 ou plus récent (24 LTS conseillé) et npm.

```bash
# Terminal 1 — API (http://localhost:3000)
cd backend
npm install
cp .env.example .env        # sous Windows PowerShell : Copy-Item .env.example .env
npm run dev

# Terminal 2 — Interface (http://localhost:5173)
cd frontend
npm install
npm run dev
```

En développement, Vite relaie les appels `/api` vers `http://localhost:3000` : le navigateur reste
sur une seule origine, comme en production derrière un reverse proxy (dans ce cas, définir
`TRUST_PROXY=1` dans le `.env` de l'API pour que la limitation de débit s'applique par client).

L'interface se met à jour automatiquement toutes les 30 secondes (onglet visible) et à la demande
(bouton « Actualiser »).

## Scripts

| Projet   | Commande                | Effet                                                  |
| -------- | ----------------------- | ------------------------------------------------------ |
| backend  | `npm run dev`           | API avec rechargement automatique (`node --watch`)     |
| backend  | `npm start`             | API en mode normal                                     |
| backend  | `npm test`              | Tests unitaires et d'intégration (Jest + Supertest)    |
| backend  | `npm run test:coverage` | Tests avec rapport de couverture                       |
| backend  | `npm run lint`          | Analyse statique ESLint                                |
| frontend | `npm run dev`           | Serveur de développement Vite                          |
| frontend | `npm run build`         | Build de production dans `dist/`                       |
| frontend | `npm run lint`          | Analyse statique (oxlint, règles React Hooks et accessibilité) |

## API

Toutes les réponses sont en JSON. Les erreurs ont toujours la forme
`{ "error": { "code", "message", "details?" } }` et ne contiennent jamais de détail technique.

| Méthode | Route             | Description                                         | Succès |
| ------- | ----------------- | --------------------------------------------------- | ------ |
| GET     | `/api/health`     | État de l'API                                       | 200    |
| GET     | `/api/board`      | Colonnes (dans l'ordre) avec leurs tâches           | 200    |
| GET     | `/api/tasks/:id`  | Détail d'une tâche                                  | 200    |
| POST    | `/api/tasks`      | Création (`name`, `color`, `columnId`, `description?`) | 201 + `Location` |
| PATCH   | `/api/tasks/:id`  | Modification partielle, dont le déplacement (`columnId`) | 200 |
| DELETE  | `/api/tasks/:id`  | Suppression                                         | 204    |

Codes d'erreur : `400` données invalides ou JSON mal formé, `404` tâche ou route inconnue,
`409` limite de tâches d'une colonne atteinte, `413` corps trop volumineux, `415` corps qui n'est
pas du JSON, `429` trop de requêtes, `500` erreur interne (message générique).

Le fichier `backend/requests.http` permet de tester chaque route depuis VS Code
(extension REST Client).

## Architecture du back-end

```
backend/src
├── server.js        démarrage du serveur HTTP (écoute du port)
├── app.js           construction de l'application Express (middlewares, routes)
├── config/          configuration lue depuis les variables d'environnement
├── routes/          définition des URL et des middlewares de validation
├── controllers/     traduction requête HTTP ↔ appel de service
├── services/        logique métier (règles Kanban, cohérence des données)
├── models/          Column et Task : représentation et invariants des données
├── data/            jeu de démonstration déterministe et stockage en mémoire
├── validators/      schémas Zod des données reçues
├── middlewares/     validation, corps JSON obligatoire, route introuvable, gestion des erreurs
├── errors/          erreurs applicatives (400, 404, 409, 415, 429)
└── utils/           journalisation
```

## Intégration continue

`.github/workflows/ci.yml` exécute, à chaque pull request et sur `main`, le lint et les tests de
l'API puis le lint et le build de l'interface ; `.github/dependabot.yml` propose chaque semaine les
mises à jour des dépendances.

## Données

Les données sont conservées en mémoire (version 1) : chaque redémarrage de l'API recharge le jeu
de démonstration. Le module `data/store.js` isole cette persistance pour pouvoir la remplacer par
une base de données sans toucher aux services ni aux routes.

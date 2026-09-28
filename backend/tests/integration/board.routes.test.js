'use strict';

const request = require('supertest');
const { createApp } = require('../../src/app');
const store = require('../../src/data/store');
const boardService = require('../../src/services/board.service');

const app = createApp();

beforeEach(() => {
  store.reset();
});

describe('GET /api/board', () => {
  it('répond 200 avec un contenu JSON', async () => {
    const response = await request(app).get('/api/board');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('renvoie les 4 colonnes dans l’ordre du processus de production', async () => {
    const response = await request(app).get('/api/board');

    expect(response.body.columns.map((column) => column.title)).toEqual([
      'À faire',
      'En cours',
      'À contrôler',
      'Terminé',
    ]);
  });

  it('respecte le format attendu pour chaque colonne et chaque tâche', async () => {
    const response = await request(app).get('/api/board');

    for (const column of response.body.columns) {
      expect(column).toEqual({
        id: expect.any(String),
        title: expect.any(String),
        position: expect.any(Number),
        wipLimit: column.wipLimit === null ? null : expect.any(Number),
        tasks: expect.any(Array),
      });

      for (const task of column.tasks) {
        expect(task).toEqual({
          id: expect.stringMatching(/^task-\d+$/),
          name: expect.any(String),
          description: expect.any(String),
          color: expect.stringMatching(/^(blue|green|orange|red|purple|grey)$/),
          columnId: column.id,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      }
    }
  });

  it('contient le jeu de démonstration complet (14 tâches)', async () => {
    const response = await request(app).get('/api/board');

    const taskCount = response.body.columns.reduce(
      (total, column) => total + column.tasks.length,
      0,
    );
    expect(taskCount).toBe(14);
  });
});

describe("Gestion des erreurs de l'API", () => {
  it('renvoie 404 au format JSON pour une route inconnue', async () => {
    const response = await request(app).get('/api/inconnue');

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: expect.any(String) },
    });
  });

  it('renvoie 404 pour une tâche qui n’existe pas', async () => {
    const response = await request(app).get('/api/tasks/task-999');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('renvoie 500 sans exposer de détail technique en cas d’erreur inattendue', async () => {
    jest.spyOn(boardService, 'getBoard').mockImplementation(() => {
      throw new Error('Connexion refusée : postgres://admin:motdepasse@db:5432');
    });

    const response = await request(app).get('/api/board');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue. Veuillez réessayer plus tard.',
      },
    });
    expect(JSON.stringify(response.body)).not.toMatch(/postgres|motdepasse|stack/);
  });
});

'use strict';

const request = require('supertest');
const { createApp } = require('../../src/app');
const store = require('../../src/data/store');

const app = createApp();

const validTask = {
  name: 'OF-2440 · Injection grilles de ventilation',
  description: 'Série de 500 pièces.',
  color: 'orange',
  columnId: 'todo',
};

beforeEach(() => {
  store.reset();
});

describe('POST /api/tasks', () => {
  it('crée une tâche valide : 201, en-tête Location et tâche complète', async () => {
    const response = await request(app).post('/api/tasks').send(validTask);

    expect(response.status).toBe(201);
    expect(response.headers.location).toBe('/api/tasks/task-15');
    expect(response.body).toEqual({
      id: 'task-15',
      ...validTask,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('rejette une tâche sans nom (400)', async () => {
    const { name: _omitted, ...withoutName } = validTask;

    const response = await request(app).post('/api/tasks').send(withoutName);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toEqual([
      { location: 'body', field: 'name', message: 'Le nom est obligatoire.' },
    ]);
  });

  it('rejette des types et des valeurs incohérents en listant chaque problème (400)', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ name: 42, color: 'rose', columnId: 'todo' });

    expect(response.status).toBe(400);
    expect(response.body.error.details.map((detail) => detail.field)).toEqual(['name', 'color']);
  });

  it('refuse les champs non autorisés comme id ou createdAt (400)', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ ...validTask, id: 'task-1', createdAt: '2020-01-01' });

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].message).toMatch(/non autorisé/);
  });

  it('refuse une colonne inexistante (400)', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ ...validTask, columnId: 'archives' });

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].field).toBe('columnId');
  });

  it('refuse un JSON mal formé (400) sans renvoyer de détail technique', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{"name": "OF-2440",}');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { code: 'INVALID_JSON', message: "Le corps de la requête n'est pas un JSON valide." },
    });
  });

  it('refuse un corps qui n’est pas au format JSON (415)', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'text/plain')
      .send('OF-2440 · Injection grilles de ventilation');

    expect(response.status).toBe(415);
    expect(response.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('déplace une tâche vers une autre colonne (200)', async () => {
    const response = await request(app)
      .patch('/api/tasks/task-1')
      .send({ columnId: 'in-progress' });

    expect(response.status).toBe(200);
    expect(response.body.columnId).toBe('in-progress');

    const board = await request(app).get('/api/board');
    const inProgress = board.body.columns.find((column) => column.id === 'in-progress');
    expect(inProgress.tasks.map((task) => task.id)).toContain('task-1');
  });

  it('refuse le déplacement vers une colonne qui a atteint sa limite (409)', async () => {
    // La colonne « En cours » contient 3 tâches pour une limite de 4.
    await request(app).patch('/api/tasks/task-1').send({ columnId: 'in-progress' }).expect(200);

    const response = await request(app)
      .patch('/api/tasks/task-2')
      .send({ columnId: 'in-progress' });

    expect(response.status).toBe(409);
    expect(response.body.error).toEqual({
      code: 'CONFLICT',
      message: 'La colonne « En cours » a atteint sa limite de 4 tâches.',
    });
  });

  it('refuse une modification sans aucun champ (400)', async () => {
    const response = await request(app).patch('/api/tasks/task-1').send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('refuse un identifiant de tâche mal formé (400)', async () => {
    const response = await request(app).patch('/api/tasks/abc').send({ name: 'Nouveau nom' });

    expect(response.status).toBe(400);
    expect(response.body.error.details[0]).toMatchObject({ location: 'params', field: 'id' });
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('supprime une tâche (204) puis la considère comme introuvable (404)', async () => {
    await request(app).delete('/api/tasks/task-14').expect(204);

    const response = await request(app).get('/api/tasks/task-14');
    expect(response.status).toBe(404);
  });
});

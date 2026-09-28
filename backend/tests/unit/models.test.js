'use strict';

const Task = require('../../src/models/Task');
const Column = require('../../src/models/Column');
const { ValidationError } = require('../../src/errors/AppError');

const validTask = {
  id: 'task-1',
  name: 'OF-2418 · Préparer le moule',
  color: 'blue',
  columnId: 'todo',
  createdAt: '2026-09-21T06:30:00.000Z',
};

describe('Modèle Task', () => {
  it('crée une tâche cohérente et sérialisable en JSON', () => {
    const task = new Task(validTask);

    expect(task.toJSON()).toEqual({
      id: 'task-1',
      name: 'OF-2418 · Préparer le moule',
      description: '',
      color: 'blue',
      columnId: 'todo',
      createdAt: '2026-09-21T06:30:00.000Z',
      updatedAt: '2026-09-21T06:30:00.000Z',
    });
    expect(Object.isFrozen(task)).toBe(true);
  });

  it('refuse un objet incomplet ou incohérent', () => {
    const create = () => new Task({ id: '', name: '  ', color: 'pink', columnId: undefined });

    expect(create).toThrow(ValidationError);
    try {
      create();
    } catch (error) {
      expect(error.details.map((detail) => detail.field)).toEqual([
        'id',
        'name',
        'color',
        'columnId',
      ]);
    }
  });

  it("produit une nouvelle instance lors d'une modification, sans changer l'id ni la date de création", () => {
    const task = new Task(validTask);
    const now = new Date('2026-09-28T08:00:00.000Z');

    const moved = task.update({ columnId: 'in-progress', id: 'pirate' }, now);

    expect(moved).not.toBe(task);
    expect(moved.id).toBe('task-1');
    expect(moved.columnId).toBe('in-progress');
    expect(moved.toJSON().createdAt).toBe('2026-09-21T06:30:00.000Z');
    expect(moved.toJSON().updatedAt).toBe('2026-09-28T08:00:00.000Z');
    expect(task.columnId).toBe('todo');
  });
});

describe('Modèle Column', () => {
  it('applique la limite de tâches en cours (WIP)', () => {
    const column = new Column({ id: 'in-progress', title: 'En cours', position: 2, wipLimit: 2 });

    expect(column.canAccept(1)).toBe(true);
    expect(column.canAccept(2)).toBe(false);
  });

  it("n'impose aucune limite quand wipLimit vaut null", () => {
    const column = new Column({ id: 'todo', title: 'À faire', position: 1 });

    expect(column.canAccept(1000)).toBe(true);
  });

  it('refuse une position ou une limite invalide', () => {
    expect(() => new Column({ id: 'x', title: 'X', position: 0, wipLimit: -1 })).toThrow(
      ValidationError,
    );
  });
});

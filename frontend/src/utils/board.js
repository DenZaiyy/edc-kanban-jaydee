/** Une colonne limitée est pleine lorsque son nombre de tâches atteint sa limite (WIP). */
export const isColumnFull = (column) =>
  column.wipLimit !== null && column.tasks.length >= column.wipLimit;

/** Style en ligne transmettant la couleur de la tâche au CSS (variable --task-color). */
export const taskColorStyle = (color) => ({ '--task-color': `var(--task-${color})` });

/** Ordre d'affichage identique à celui de l'API : ordre de création (task-1, task-2…). */
const taskNumber = (task) => Number(task.id.replace('task-', ''));
const byCreationOrder = (a, b) => taskNumber(a) - taskNumber(b);

/**
 * Place une tâche (telle que renvoyée par l'API) dans sa colonne,
 * en la retirant de son ancienne colonne si elle a été déplacée.
 */
export const placeTask = (columns, task) =>
  columns.map((column) => {
    const others = column.tasks.filter((item) => item.id !== task.id);
    return column.id === task.columnId
      ? { ...column, tasks: [...others, task].sort(byCreationOrder) }
      : { ...column, tasks: others };
  });

/** Retire une tâche du tableau. */
export const removeTask = (columns, taskId) =>
  columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => task.id !== taskId),
  }));

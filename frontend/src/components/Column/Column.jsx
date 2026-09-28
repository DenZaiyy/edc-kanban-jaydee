import IconButton from '../IconButton/IconButton.jsx';
import TaskCard from '../TaskCard/TaskCard.jsx';
import { isColumnFull } from '../../utils/board.js';
import styles from './Column.module.css';

/** Colonne du tableau : en-tête (titre, compteur, limite) et liste défilante de cartes. */
export default function Column({
  column,
  previousColumn,
  nextColumn,
  onCreateTask,
  onOpenTask,
  onMoveTask,
}) {
  const titleId = `column-${column.id}-title`;
  const taskCount = column.tasks.length;
  const isFull = isColumnFull(column);
  const counter = column.wipLimit === null ? `${taskCount}` : `${taskCount} / ${column.wipLimit}`;

  return (
    <section id={`column-${column.id}`} className={styles.column} aria-labelledby={titleId}>
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {column.title}
        </h2>
        <span className={`${styles.counter} ${isFull ? styles.counterFull : ''}`}>
          {counter}
          <span className="visually-hidden">
            {column.wipLimit === null ? ' tâches' : ` tâches, limite de ${column.wipLimit}`}
          </span>
        </span>
        {isFull && <span className={styles.limit}>Limite atteinte</span>}
        <IconButton
          icon="plus"
          label={`Ajouter une tâche dans « ${column.title} »`}
          className={styles.add}
          disabled={isFull}
          onClick={() => onCreateTask(column.id)}
        />
      </header>

      {taskCount === 0 ? (
        <p className={styles.empty}>Aucune tâche</p>
      ) : (
        <ul className={styles.list}>
          {column.tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                previousColumn={previousColumn}
                nextColumn={nextColumn}
                onOpen={onOpenTask}
                onMove={onMoveTask}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

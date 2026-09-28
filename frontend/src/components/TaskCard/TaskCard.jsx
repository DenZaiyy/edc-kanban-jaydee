import Icon from '../Icon/Icon.jsx';
import IconButton from '../IconButton/IconButton.jsx';
import { isColumnFull, taskColorStyle } from '../../utils/board.js';
import { formatShortDate } from '../../utils/formatDate.js';
import styles from './TaskCard.module.css';

/**
 * Carte d'une tâche.
 * Toute la carte est cliquable (consultation / modification) grâce au bouton du titre ;
 * les flèches déplacent la tâche vers la colonne précédente ou suivante.
 */
export default function TaskCard({ task, previousColumn, nextColumn, onOpen, onMove }) {
  const titleId = `task-${task.id}-title`;

  return (
    <article className={styles.card} style={taskColorStyle(task.color)} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.title}>
        <button type="button" className={styles.open} onClick={() => onOpen(task)}>
          {task.name}
        </button>
      </h3>

      {task.description && <p className={styles.description}>{task.description}</p>}

      <footer className={styles.footer}>
        <span className={styles.meta}>
          <Icon name="clock" size={14} />
          <span>
            Modifiée le <time dateTime={task.updatedAt}>{formatShortDate(task.updatedAt)}</time>
          </span>
        </span>

        <div className={styles.actions}>
          {previousColumn && (
            <IconButton
              icon="arrow-left"
              label={`Déplacer vers « ${previousColumn.title} »`}
              disabled={isColumnFull(previousColumn)}
              onClick={() => onMove(task, previousColumn.id)}
            />
          )}
          {nextColumn && (
            <IconButton
              icon="arrow-right"
              label={`Déplacer vers « ${nextColumn.title} »`}
              disabled={isColumnFull(nextColumn)}
              onClick={() => onMove(task, nextColumn.id)}
            />
          )}
        </div>
      </footer>
    </article>
  );
}

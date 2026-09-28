import Button from '../Button/Button.jsx';
import { formatTime } from '../../utils/formatDate.js';
import styles from './AppHeader.module.css';

/** En-tête de l'application : identité, heure de mise à jour et actions globales. */
export default function AppHeader({ lastUpdated, isRefreshing, canEdit, onRefresh, onCreateTask }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          J
        </span>
        <div>
          <h1 className={styles.title}>
            Jaydee · Kanban<span className={styles.long}> de production</span>
          </h1>
          <p className={styles.subtitle}>
            Atelier injection<span className={styles.long}> — suivi des ordres de fabrication</span>
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        {lastUpdated && (
          <p className={styles.updated}>
            Mis à jour à <time dateTime={lastUpdated.toISOString()}>{formatTime(lastUpdated)}</time>
          </p>
        )}
        <Button
          variant="ghost"
          icon="refresh"
          collapseLabel
          onClick={onRefresh}
          disabled={!canEdit || isRefreshing}
        >
          {isRefreshing ? 'Actualisation…' : 'Actualiser'}
        </Button>
        <Button variant="primary" icon="plus" onClick={onCreateTask} disabled={!canEdit}>
          Nouvelle tâche
        </Button>
      </div>
    </header>
  );
}

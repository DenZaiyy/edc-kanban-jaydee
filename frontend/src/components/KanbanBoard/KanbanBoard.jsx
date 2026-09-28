import { useCallback, useState } from 'react';
import { useBoard } from '../../hooks/useBoard.js';
import AppHeader from '../AppHeader/AppHeader.jsx';
import Button from '../Button/Button.jsx';
import Column from '../Column/Column.jsx';
import Notification from '../Notification/Notification.jsx';
import TaskFormDialog from '../TaskFormDialog/TaskFormDialog.jsx';
import styles from './KanbanBoard.module.css';

/**
 * Composant principal : charge le tableau depuis l'API au démarrage,
 * affiche les colonnes et orchestre création, modification et déplacement des tâches.
 */
export default function KanbanBoard() {
  const {
    columns,
    status,
    error,
    lastUpdated,
    retry,
    refresh,
    createTask,
    updateTask,
    deleteTask,
  } = useBoard();

  // null | { mode: 'create', columnId } | { mode: 'edit', task }
  const [dialog, setDialog] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const closeDialog = useCallback(() => setDialog(null), []);
  const closeNotification = useCallback(() => setNotification(null), []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } catch (err) {
      setNotification(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMoveTask = async (task, columnId) => {
    try {
      await updateTask(task.id, { columnId });
    } catch (err) {
      setNotification(err.message);
    }
  };

  // Les erreurs de soumission sont affichées dans la fenêtre elle-même.
  const handleSubmitTask = async (values) => {
    if (dialog.mode === 'create') await createTask(values);
    else await updateTask(dialog.task.id, values);
    setDialog(null);
  };

  const handleDeleteTask = async () => {
    await deleteTask(dialog.task.id);
    setDialog(null);
  };

  let content;
  if (status === 'loading') {
    content = <output className={styles.state}>Chargement du tableau…</output>;
  } else if (status === 'error') {
    content = (
      <div className={styles.state} role="alert">
        <p className={styles.stateTitle}>Impossible de charger le tableau</p>
        <p>{error.message}</p>
        <Button variant="primary" icon="refresh" onClick={retry}>
          Réessayer
        </Button>
      </div>
    );
  } else {
    content = (
      <div className={styles.board}>
        {columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            previousColumn={columns[index - 1]}
            nextColumn={columns[index + 1]}
            onCreateTask={(columnId) => setDialog({ mode: 'create', columnId })}
            onOpenTask={(task) => setDialog({ mode: 'edit', task })}
            onMoveTask={handleMoveTask}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <AppHeader
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        canEdit={status === 'success'}
        onRefresh={handleRefresh}
        onCreateTask={() => setDialog({ mode: 'create', columnId: columns[0]?.id })}
      />

      <main className={styles.main}>{content}</main>

      {notification && <Notification message={notification} onClose={closeNotification} />}

      {dialog && (
        <TaskFormDialog
          mode={dialog.mode}
          task={dialog.task}
          defaultColumnId={dialog.columnId}
          columns={columns}
          onSubmit={handleSubmitTask}
          onDelete={handleDeleteTask}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

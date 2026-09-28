import { useCallback, useEffect, useRef, useState } from 'react';
import { kanbanApi } from '../api/kanbanApi.js';
import { placeTask, removeTask } from '../utils/board.js';

/** Intervalle de mise à jour automatique du tableau partagé entre plusieurs postes. */
const AUTO_REFRESH_INTERVAL = 30_000;

/**
 * État du tableau Kanban et actions associées.
 * - Le tableau est chargé au montage, puis actualisé toutes les 30 s (onglet visible)
 *   ou à la demande, pour refléter les changements faits depuis les autres postes.
 * - Une modification n'est affichée qu'après confirmation de l'API : c'est la tâche
 *   renvoyée par le serveur qui est placée dans le tableau.
 *
 * status : 'loading' (premier chargement) | 'success' | 'error'
 */
export function useBoard() {
  const [columns, setColumns] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Numéro du dernier chargement lancé : une réponse plus ancienne est ignorée,
  // pour qu'un rechargement lent n'écrase pas des données plus récentes.
  const latestRequest = useRef(0);

  const applyBoard = useCallback((board, requestId) => {
    if (requestId !== latestRequest.current) return;
    setColumns(board.columns);
    setLastUpdated(new Date());
  }, []);

  const loadBoard = useCallback(
    async (signal) => {
      latestRequest.current += 1;
      const requestId = latestRequest.current;
      applyBoard(await kanbanApi.getBoard(signal), requestId);
    },
    [applyBoard],
  );

  // Chargement déclenché au montage du composant (annulé s'il est démonté entre-temps).
  useEffect(() => {
    const controller = new AbortController();
    latestRequest.current += 1;
    const requestId = latestRequest.current;

    kanbanApi
      .getBoard(controller.signal)
      .then((board) => {
        applyBoard(board, requestId);
        setStatus('success');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err);
        setStatus('error');
      });

    return () => controller.abort();
  }, [applyBoard]);

  // Mise à jour automatique, suspendue quand l'onglet n'est pas affiché.
  useEffect(() => {
    if (status !== 'success') return undefined;

    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      // Un échec ponctuel n'interrompt pas l'affichage : l'heure de dernière
      // mise à jour, visible dans l'en-tête, indique la fraîcheur des données.
      loadBoard().catch(() => {});
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, [status, loadBoard]);

  /** Nouvelle tentative après un échec du premier chargement. */
  const retry = useCallback(async () => {
    setStatus('loading');
    try {
      await loadBoard();
      setError(null);
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, [loadBoard]);

  /** Actualisation à la demande ; l'erreur éventuelle est remontée à l'appelant. */
  const refresh = useCallback(() => loadBoard(), [loadBoard]);

  /** Applique une modification confirmée par l'API et invalide les chargements en cours. */
  const applyChange = useCallback((update) => {
    latestRequest.current += 1;
    setColumns(update);
  }, []);

  const createTask = useCallback(
    async (values) => {
      const task = await kanbanApi.createTask(values);
      applyChange((current) => placeTask(current, task));
      return task;
    },
    [applyChange],
  );

  const updateTask = useCallback(
    async (id, changes) => {
      const task = await kanbanApi.updateTask(id, changes);
      applyChange((current) => placeTask(current, task));
      return task;
    },
    [applyChange],
  );

  const deleteTask = useCallback(
    async (id) => {
      await kanbanApi.deleteTask(id);
      applyChange((current) => removeTask(current, id));
    },
    [applyChange],
  );

  return {
    columns,
    status,
    error,
    lastUpdated,
    retry,
    refresh,
    createTask,
    updateTask,
    deleteTask,
  };
}

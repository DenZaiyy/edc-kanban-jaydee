import { useEffect, useId, useRef, useState } from 'react';
import Button from '../Button/Button.jsx';
import IconButton from '../IconButton/IconButton.jsx';
import {
  DEFAULT_TASK_COLOR,
  TASK_COLORS,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_NAME_MAX_LENGTH,
} from '../../constants/tasks.js';
import { isColumnFull, taskColorStyle } from '../../utils/board.js';
import { formatDateTime } from '../../utils/formatDate.js';
import styles from './TaskFormDialog.module.css';

/** Contrôles côté client (confort de saisie) ; l'API reste seule garante de la validité. */
function validate(values) {
  const errors = {};
  const name = values.name.trim();
  if (name === '') errors.name = 'Le nom est obligatoire.';
  else if (name.length > TASK_NAME_MAX_LENGTH)
    errors.name = `Le nom ne doit pas dépasser ${TASK_NAME_MAX_LENGTH} caractères.`;
  if (values.description.trim().length > TASK_DESCRIPTION_MAX_LENGTH)
    errors.description = `La description ne doit pas dépasser ${TASK_DESCRIPTION_MAX_LENGTH} caractères.`;
  return errors;
}

/**
 * Fenêtre de création (mode « create ») ou de consultation / modification (mode « edit »)
 * d'une tâche, basée sur l'élément HTML natif <dialog>.
 */
export default function TaskFormDialog({
  mode,
  task,
  defaultColumnId,
  columns,
  onSubmit,
  onDelete,
  onClose,
}) {
  const isEdit = mode === 'edit';
  const id = useId();
  const dialogRef = useRef(null);
  const nameRef = useRef(null);

  const [values, setValues] = useState(() => ({
    name: task?.name ?? '',
    description: task?.description ?? '',
    columnId: task?.columnId ?? defaultColumnId,
    color: task?.color ?? DEFAULT_TASK_COLOR,
  }));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Ouverture en fenêtre modale native : focus piégé, touche Échap, arrière-plan inerte.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    nameRef.current.focus();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const showApiError = (error) => {
    const byField = {};
    for (const detail of error.details ?? []) {
      if (detail.field && !byField[detail.field]) byField[detail.field] = detail.message;
    }
    setFieldErrors(byField);
    setFormError(error.message);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
        columnId: values.columnId,
        color: values.color,
      });
    } catch (error) {
      showApiError(error);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await onDelete();
    } catch (error) {
      showApiError(error);
      setIsSubmitting(false);
      setConfirmDelete(false);
    }
  };

  const describedBy = (field, hintId) => (fieldErrors[field] ? `${id}-${field}-error` : hintId);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
    >
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 id={`${id}-title`} className={styles.title}>
            {isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <p className={styles.subtitle}>
            {isEdit
              ? `Créée le ${formatDateTime(task.createdAt)} · modifiée le ${formatDateTime(task.updatedAt)}`
              : 'Ajoutez une étape d’ordre de fabrication au tableau.'}
          </p>
        </div>
        <IconButton icon="close" label="Fermer" onClick={onClose} />
      </div>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <form id={`${id}-form`} className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`} className={styles.label}>
            Nom de la tâche <span aria-hidden="true">*</span>
          </label>
          <input
            ref={nameRef}
            id={`${id}-name`}
            name="name"
            type="text"
            className={styles.input}
            value={values.name}
            onChange={handleChange}
            required
            maxLength={TASK_NAME_MAX_LENGTH}
            autoComplete="off"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={describedBy('name', `${id}-name-hint`)}
          />
          {fieldErrors.name ? (
            <p id={`${id}-name-error`} className={styles.error}>
              {fieldErrors.name}
            </p>
          ) : (
            <p id={`${id}-name-hint`} className={styles.hint}>
              Obligatoire · {TASK_NAME_MAX_LENGTH} caractères maximum
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor={`${id}-description`} className={styles.label}>
            Description
          </label>
          <textarea
            id={`${id}-description`}
            name="description"
            className={`${styles.input} ${styles.textarea}`}
            rows={3}
            value={values.description}
            onChange={handleChange}
            maxLength={TASK_DESCRIPTION_MAX_LENGTH}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={fieldErrors.description ? `${id}-description-error` : undefined}
          />
          {fieldErrors.description && (
            <p id={`${id}-description-error`} className={styles.error}>
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor={`${id}-column`} className={styles.label}>
              Colonne
            </label>
            <select
              id={`${id}-column`}
              name="columnId"
              className={`${styles.input} ${styles.select}`}
              value={values.columnId}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.columnId)}
              aria-describedby={fieldErrors.columnId ? `${id}-column-error` : undefined}
            >
              {columns.map((column) => {
                const unavailable = column.id !== task?.columnId && isColumnFull(column);
                return (
                  <option key={column.id} value={column.id} disabled={unavailable}>
                    {column.title}
                    {unavailable ? ' (limite atteinte)' : ''}
                  </option>
                );
              })}
            </select>
            {fieldErrors.columnId && (
              <p id={`${id}-column-error`} className={styles.error}>
                {fieldErrors.columnId}
              </p>
            )}
          </div>

          <fieldset
            className={styles.field}
            aria-describedby={fieldErrors.color ? `${id}-color-error` : undefined}
          >
            <legend className={styles.label}>Couleur</legend>
            <div className={styles.swatches}>
              {TASK_COLORS.map((color) => (
                <label
                  key={color.value}
                  className={styles.swatch}
                  style={taskColorStyle(color.value)}
                  title={color.label}
                >
                  <input
                    type="radio"
                    name="color"
                    value={color.value}
                    checked={values.color === color.value}
                    onChange={handleChange}
                  />
                  <span className="visually-hidden">{color.label}</span>
                </label>
              ))}
            </div>
            {fieldErrors.color && (
              <p id={`${id}-color-error`} className={styles.error}>
                {fieldErrors.color}
              </p>
            )}
          </fieldset>
        </div>
      </form>

      <div className={styles.footer}>
        {isEdit && (
          <Button
            variant="danger"
            icon="trash"
            disabled={isSubmitting}
            onClick={confirmDelete ? handleDelete : () => setConfirmDelete(true)}
          >
            {confirmDelete ? 'Confirmer la suppression' : 'Supprimer'}
          </Button>
        )}
        <span className={styles.spacer} />
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" type="submit" form={`${id}-form`} disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer la tâche'}
        </Button>
      </div>
    </dialog>
  );
}

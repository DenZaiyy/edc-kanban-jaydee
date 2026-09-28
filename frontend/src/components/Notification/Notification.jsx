import IconButton from '../IconButton/IconButton.jsx';
import styles from './Notification.module.css';

/**
 * Message d'erreur non bloquant (ex. refus de l'API).
 * Il reste affiché jusqu'à sa fermeture par l'utilisateur ou jusqu'au message suivant,
 * pour laisser le temps de le lire.
 */
export default function Notification({ message, onClose }) {
  return (
    <div className={styles.notification} role="alert">
      <p className={styles.message}>{message}</p>
      <IconButton
        icon="close"
        label="Fermer le message"
        onClick={onClose}
        className={styles.close}
      />
    </div>
  );
}

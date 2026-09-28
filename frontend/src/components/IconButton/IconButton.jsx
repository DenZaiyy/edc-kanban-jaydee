import Icon from '../Icon/Icon.jsx';
import styles from './IconButton.module.css';

/** Bouton ne contenant qu'une icône : le libellé est fourni aux lecteurs d'écran et en infobulle. */
export default function IconButton({ icon, label, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`${styles.iconButton} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

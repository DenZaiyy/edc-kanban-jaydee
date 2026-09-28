import Icon from '../Icon/Icon.jsx';
import styles from './Button.module.css';

/**
 * Bouton texte réutilisable.
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {string} [icon] Nom d'une icône affichée avant le libellé
 * @param {boolean} [collapseLabel] Sur petit écran, n'affiche que l'icône (libellé conservé pour l'accessibilité)
 */
export default function Button({
  variant = 'secondary',
  icon,
  collapseLabel = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const classes = [styles.button, styles[variant], collapseLabel && styles.collapsible, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {icon && <Icon name={icon} size={18} />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}

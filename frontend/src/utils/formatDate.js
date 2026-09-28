const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const hourMinute = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

/** « 21 sept. » */
export const formatShortDate = (value) => dayMonth.format(new Date(value));

/** « 08:42 » */
export const formatTime = (value) => hourMinute.format(new Date(value));

/** « 21 sept. à 08:30 » */
export const formatDateTime = (value) => `${formatShortDate(value)} à ${formatTime(value)}`;

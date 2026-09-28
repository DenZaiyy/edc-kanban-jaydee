const PATHS = {
  plus: <path d="M12 5v14M5 12h14" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v5h-5" />
    </>
  ),
  'arrow-left': <path d="M19 12H5M11 18l-6-6 6-6" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  trash: <path d="M4 7h16M9 7V4h6v3M18 7l-1 13H7L6 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
};

/** Icône SVG décorative (le libellé est porté par le bouton qui la contient). */
export default function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

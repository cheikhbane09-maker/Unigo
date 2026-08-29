/** Petite bibliothèque d'icônes SVG inline (aucune dépendance externe). */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Svg = ({ children, size = 20, className = '', ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
    {...base}
    {...rest}
  >
    {children}
  </svg>
);

export const IconCap = (p) => (
  <Svg {...p}>
    <path d="M22 9 12 5 2 9l10 4 10-4Z" />
    <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
  </Svg>
);

export const IconBus = (p) => (
  <Svg {...p}>
    <path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
    <path d="M4 11h16M7 20v-2M17 20v-2" />
    <circle cx="7.5" cy="16.5" r="1.2" />
    <circle cx="16.5" cy="16.5" r="1.2" />
  </Svg>
);

export const IconSparkles = (p) => (
  <Svg {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="m6.3 6.3 2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" />
  </Svg>
);

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const IconHeart = ({ filled = false, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" />
  </Svg>
);

export const IconStar = ({ filled = false, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z" />
  </Svg>
);

export const IconPin = (p) => (
  <Svg {...p}>
    <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.2" />
  </Svg>
);

export const IconGlobe = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
  </Svg>
);

export const IconUser = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
  </Svg>
);

export const IconShield = (p) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 7.7 7 9.5 4.1-1.8 7-5.2 7-9.5V6l-7-3Z" />
    <path d="m9.5 12 1.8 1.8L15 10" />
  </Svg>
);

export const IconDoc = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Svg>
);

export const IconScale = (p) => (
  <Svg {...p}>
    <path d="M12 4v16M6 8h12M4 20h16" />
    <path d="m6 8-3 6h6l-3-6ZM18 8l-3 6h6l-3-6Z" />
  </Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Svg>
);

export const IconX = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconArrow = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconCalendar = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);

export const IconInfo = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

export const IconLogout = (p) => (
  <Svg {...p}>
    <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
    <path d="M10 12h10M17 9l3 3-3 3" />
  </Svg>
);

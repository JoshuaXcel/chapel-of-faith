// All the little line icons used on the site, in one place.
// Each entry is the inside of a 24x24 SVG drawing. Use it like: <Icon name="calendar" />
const paths = {
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  bank: <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3.5 20.5h17" />,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  book: <><path d="M3 5.5C5.6 4.4 8.6 4.6 12 6.6c3.4-2 6.4-2.2 9-1.1v13c-2.6-1.1-5.6-.9-9 1.1-3.4-2-6.4-2.2-9-1.1z" /><path d="M12 6.6v13" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  cross: <path d="M12 3v18M7 8.5h10" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  facebook: <path d="M14 21v-7.5h2.6l.4-3H14V8.6c0-.9.3-1.6 1.6-1.6H17V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9v2.4H8.5v3H11V21" />,
  flame: <path d="M12 21c-3.6 0-6-2.4-6-5.6 0-3.6 3-5.4 3.4-9.4 2.6 1.6 4 4 4 6.2.9-.6 1.5-1.7 1.6-3 1.9 1.6 3 3.8 3 6.2 0 3.2-2.4 5.6-6 5.6z" />,
  forward: <><path d="M20 12a8 8 0 1 1-2.4-5.7" /><path d="M20 4v4.5h-4.5" /></>,
  gift: <><rect x="3.5" y="8" width="17" height="4" rx="1" /><path d="M5.5 12v8h13v-8M12 8v12" /><path d="M12 8c-2.5 0-4.5-.6-4.5-2.2S9.6 3.6 12 8zm0 0c2.5 0 4.5-.6 4.5-2.2S14.4 3.6 12 8z" /></>,
  headphones: <><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4.5" height="6.5" rx="1.6" /><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.6" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />,
  home: <path d="M4 11 12 4.5l8 6.5v8.5a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m20.5 16-5-5-9 9" /></>,
  inbox: <><path d="M3.5 13.5 6 5h12l2.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z" /><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5" /></>,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></>,
  layers: <><path d="m12 3.5 9 4.5-9 4.5-9-4.5z" /><path d="m3 12.5 9 4.5 9-4.5" /></>,
  live: <><circle cx="12" cy="12" r="2.5" fill="currentColor" /><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" /></>,
  lock: <><rect x="5" y="11" width="14" height="9.5" rx="2.2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  logout: <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h10" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  mapPin: <><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  message: <path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L4 20l1.3-4.4A8 8 0 1 1 20.5 11.5z" />,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></>,
  monitor: <><rect x="2.5" y="4.5" width="19" height="13" rx="2.5" /><path d="M8 21h8" /><path d="m10 8.5 4.5 2.5-4.5 2.5z" fill="currentColor" stroke="none" /></>,
  music: <><path d="M9 18V5.5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16.5" r="2.5" /></>,
  pause: <><rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /></>,
  pen: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
  phone: <path d="M5.5 3.5h3.2l1.8 4.6-2.3 1.4a11.5 11.5 0 0 0 5.3 5.3l1.4-2.3 4.6 1.8v3.2a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2z" />,
  play: <path d="M8 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2a.8.8 0 0 0-1.2.7z" fill="currentColor" stroke="none" />,
  plus: <path d="M12 5v14M5 12h14" />,
  rewind: <><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4.5h4.5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  send: <path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></>,
  share: <><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" /></>,
  shield: <><path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6z" /><path d="m9 12 2 2 4-4" /></>,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" /></>,
  trash: <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.8.7 3 2.4 3.5 5.2" /></>,
  whatsapp: <><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.3A8.5 8.5 0 1 1 20.5 11.7z" /><path d="M9 8.5c0 3.5 2.7 6.5 6.5 6.5l1-1.7-2-1-1 .9c-1-.5-2-1.5-2.5-2.5l.9-1-1-2z" /></>,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>,
}

function Icon({ name, size = 20 }) {
  return (
    <svg
      className="i"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export default Icon

/**
 * Interface icons as inline SVG.
 *
 * The prototype previously used Unicode dingbats (⌂ ⌕ ▤ ♧), which are rendered
 * by whichever font the operating system substitutes — inconsistent weight,
 * inconsistent baseline, and some platforms fall back to boxes. These are drawn
 * on one 24px grid with a single stroke weight, inherit `currentColor`, and
 * never depend on an installed font.
 */

const P = {
  home: '<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.8V21h13V9.8"/><path d="M9.5 21v-6h5v6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
  cap: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 11.2a3 3 0 0 0 0-6"/><path d="M18.5 20c0-2.6-1-4.4-2.6-5.2"/>',
  newspaper: '<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><path d="M7 8h7M7 12h7M7 16h4"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 6 3.5-6 3.5z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5"/>',
  userCheck: '<circle cx="10" cy="8" r="3.4"/><path d="M3.5 20c0-3.6 2.9-6 6.5-6 1.2 0 2.3.3 3.2.8"/><path d="m15.5 17.5 2 2 4-4"/>',
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16"/><path d="M15 9h4a1 1 0 0 1 1 1v11"/><path d="M8 8h3M8 12h3M8 16h3"/><path d="M2 21h20"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  chart: '<path d="M4 20v-6M10 20V8M16 20v-9M22 20H2"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  box: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
  palette:
    '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.1"/><circle cx="12" cy="7.5" r="1.1"/><circle cx="15.5" cy="10" r="1.1"/><circle cx="12" cy="15" r="1.1"/>',
  sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  bell: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.5 20a2 2 0 0 0 3 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  dot: '<circle cx="12" cy="12" r="3"/>',
}

/** Workspace and page navigation icons. */
export const NAV_ICONS = {
  Home: 'home',
  Discover: 'search',
  Learn: 'cap',
  'Community & Events': 'users',
  'Latest News': 'newspaper',
  'Listen & Watch': 'play',
  'About IGIFY': 'info',
  'My Profile': 'user',
  'Continue Learning': 'cap',
  'Saved Resources': 'bookmark',
  Messages: 'mail',
  'My Groups': 'users',
  Overview: 'grid',
  'Organisation Profile': 'building',
  Members: 'users',
  Content: 'file',
  Events: 'calendar',
  Resources: 'folder',
  Reports: 'chart',
  Dashboard: 'grid',
  'Users & Identity': 'userCheck',
  Organisations: 'building',
  'Content & Editorial': 'file',
  'Community & Safety': 'shield',
  'Modules & Services': 'box',
  'Appearance & Interface': 'palette',
  'Platform & System': 'sliders',
  'Audit & Activity': 'list',
}

/**
 * @param {keyof typeof P} name
 * @param {number} size
 * @returns {string} inline SVG markup
 */
export function iconSvg(name, size = 18) {
  const body = P[name] || P.dot
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`
}

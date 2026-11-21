import './style.css'
import photoCredits from '../docs/photo-credits.json'
import { store } from './data/index.js'
import { CARD_LINKS, findRecord, TYPE_LABELS } from './content/catalogue.js'
import { ACTION_LABELS, actionsFor, isEditable, STATUS_LABELS } from './content/workflow.js'
import { findService, HEALTH_LABELS, SERVICES, SERVICE_STATUS_LABELS } from './content/services.js'
import { iconSvg, NAV_ICONS } from './icons.js'
import { parseRoute, routeHash } from './router.js'
import { searchAll, TYPE_PAGE } from './search.js'

// ── Configuration ─────────────────────────────────────────────────────────

const themeNames = {
  deep: 'Deep Charcoal',
  classic: 'Classic Charcoal',
  soft: 'Soft Charcoal',
  executive: 'Executive Charcoal',
  mist: 'Mist Charcoal',
}

const environments = {
  public: {
    label: 'Public',
    title: 'Discover IGIFY',
    subtitle: 'Discover. Learn. Connect.',
    nav: ['Home', 'Discover', 'Learn', 'Community & Events', 'Latest News', 'Listen & Watch', 'About IGIFY'],
  },
  member: {
    label: 'Member',
    title: 'My Space',
    subtitle: 'Your community, learning and saved resources.',
    nav: ['Home', 'My Profile', 'Continue Learning', 'Saved Resources', 'Messages', 'My Groups', 'Community & Events'],
  },
  org: {
    label: 'Organisation Admin',
    title: 'Organisation workspace',
    subtitle: 'Manage your organisation’s presence and activities.',
    nav: ['Overview', 'Organisation Profile', 'Members', 'Content', 'Events', 'Resources', 'Reports'],
  },
  admin: {
    label: 'IGIFY Administrator',
    title: 'Administrator Dashboard',
    subtitle: 'Platform oversight, governance and operations.',
    nav: ['Dashboard', 'Users & Identity', 'Organisations', 'Content & Editorial', 'Community & Safety', 'Modules & Services', 'Appearance & Interface', 'Platform & System', 'Audit & Activity'],
  },
}

// ── State ─────────────────────────────────────────────────────────────────
// Interface preferences and domain data both come from the store. Only
// transient view state lives purely in memory.

const state = {
  ...store.getPreferences(),
  search: '',
  toast: '',
  offline: false,
  modal: null, // null | 'profile' | 'notifications' | 'create' | 'create-form' | 'credits'
  createType: null, // key of CREATE_TYPES while the create form is open
  detail: null, // { type, id } when a record detail screen is open
  profile: store.getProfile(),
  notifications: store.listNotifications(),
  items: store.allRecords(),
  audit: store.listAudit(),
  services: store.listServiceOverrides(),
  orgProfile: store.getOrgProfile(),
}

// A shared or reloaded URL wins over the last visited page.
const initialRoute = parseRoute(window.location.hash, environments)
if (initialRoute) {
  state.env = initialRoute.env
  state.page = initialRoute.page
  state.detail = initialRoute.detail
  state.search = initialRoute.search || ''
} else {
  // Give the first screen an address without triggering a second render.
  try {
    window.history.replaceState(null, '', routeHash({ env: state.env, page: state.page }))
  } catch (err) {
    /* history may be unavailable in some embedded contexts */
  }
}

function applyRoute(route) {
  if (!route) return
  state.env = route.env
  state.page = route.page
  state.detail = route.detail || null
  state.search = route.search || ''
  saveState()
  render()
}

/** Navigate, keeping the address bar in step with the screen. */
function go(route) {
  const hash = routeHash(route)
  if (window.location.hash === hash) applyRoute(route)
  else window.location.hash = hash
}

window.addEventListener('hashchange', () => {
  applyRoute(parseRoute(window.location.hash, environments))
})

function saveState() {
  store.setPreferences({
    env: state.env,
    page: state.page,
    theme: state.theme,
    dark: state.dark,
    sidebar: state.sidebar,
    collapsed: state.collapsed,
  })
}

// ── Icons ─────────────────────────────────────────────────────────────────
// Drawn inline (see icons.js) rather than using font-dependent dingbats.

const icon = (name) => iconSvg(NAV_ICONS[name] || 'dot')

// ── Notifications ─────────────────────────────────────────────────────────

let toastTimer = null

function notify(message) {
  if (toastTimer) clearTimeout(toastTimer)
  state.toast = message
  render()
  toastTimer = setTimeout(() => { state.toast = ''; render() }, 2300)
}

// ── Cards ─────────────────────────────────────────────────────────────────

// Photographs for content cards. Titles not listed here render as plain text
// cards, which is intentional for administrative and utility screens where an
// image would add weight without meaning.
// NOTE: these are generic sample photographs (see public/images/README.md).
// Replace them with IGIFY's own provincial photographs before public use.
const CARD_IMAGE_BY_TITLE = {
  // News and official notices
  'Featured story': 'news',
  'IGIFY announcements': 'news',
  'Community update': 'town',
  'Community announcements': 'town',
  'Organisation notices': 'town',
  'Local services': 'community',
  'Community noticeboard': 'town',
  'History & Archives': 'town',

  // Education
  'Learning spotlight': 'learn',
  Learn: 'learn',
  'Study resources': 'learn',
  'Digital library': 'learn',
  'Your learning': 'learn',
  'Last lesson': 'learn',
  'Saved resources': 'learn',
  'Saved lessons': 'learn',
  'Education and opportunity': 'school',
  'Exam preparation': 'school',
  'Learning events': 'school',
  'Educational video': 'school',
  'Recent activity': 'school',
  'Saved articles': 'school',

  // Discovery
  Discover: 'discover',
  'Search IGIFY': 'discover',
  'World trending': 'landscape',
  'Learning opportunities': 'landscape',

  // Skills, faith, community
  'Skills & Farming': 'farming',
  'Faith & Family': 'faith',
  'Faith & Family events': 'faith',
  'Faith & Family learning': 'faith',
  'Community highlight': 'festival',
  'Community trending': 'community',
  'Community & Events': 'festival',
  'Local initiatives': 'community',
  'Upcoming events': 'festival',
  'Organisation updates': 'town',
  'Public group information': 'garden',
  Services: 'community',
  'Community activity': 'garden',

  // Media
  'Listen & Watch': 'media',
  'Radio stations': 'media',
  'Television channels': 'media',
  'Music discovery': 'dance',
  'Recorded audio': 'performance',
  'Video library': 'performance',
}

function imageFor(title) {
  const key = CARD_IMAGE_BY_TITLE[title]
  return key ? `/images/card-${key}.jpg` : null
}

/**
 * Cards with no suitable photograph get a designed tile instead: a large icon
 * and a short label on a restrained charcoal surface. This is deliberate
 * design, not a missing image — currently the broadcast and audio cards, since
 * no Papua New Guinea radio or television photography exists in the commons.
 */
const CARD_TILES = {
  // Broadcast and audio: no suitable PNG photograph exists, so the format is
  // shown as a designed tile with a visible label.
  'Radio stations': { icon: 'radio', label: 'Radio' },
  'Television channels': { icon: 'tv', label: 'Television' },
  'Recorded audio': { icon: 'headphones', label: 'Audio' },

  // Utility and administrative cards: a compact icon band, no label, so the
  // card keeps a visual anchor without repeating its heading.
  'Learning & opportunity': { icon: 'cap', compact: true },
  'Digital skills': { icon: 'cap', compact: true },
  'Public browsing': { icon: 'search', compact: true },
  'Registered features': { icon: 'userCheck', compact: true },
  'Local & offline': { icon: 'wifiOff', compact: true },
  Progress: { icon: 'chart', compact: true },
  'Saved books': { icon: 'bookmark', compact: true },
  'Unread messages': { icon: 'mail', compact: true },
  Conversations: { icon: 'mail', compact: true },
  'Group updates': { icon: 'users', compact: true },
  'Group activity': { icon: 'users', compact: true },
  Membership: { icon: 'users', compact: true },
  Participation: { icon: 'users', compact: true },
  'Pending tasks': { icon: 'clock', compact: true },
  'Membership summary': { icon: 'chart', compact: true },
  'Public information': { icon: 'file', compact: true },
  Review: { icon: 'check', compact: true },
  Members: { icon: 'users', compact: true },
  Roles: { icon: 'key', compact: true },
  Rules: { icon: 'shield', compact: true },
  'Prepare content': { icon: 'file', compact: true },
  Publishing: { icon: 'file', compact: true },
  'Manage events': { icon: 'calendar', compact: true },
  Visibility: { icon: 'eye', compact: true },
  'Manage resources': { icon: 'folder', compact: true },
  Permissions: { icon: 'key', compact: true },
  Engagement: { icon: 'chart', compact: true },
  Activity: { icon: 'activity', compact: true },
  'User directory': { icon: 'userCheck', compact: true },
  'Registration review': { icon: 'userCheck', compact: true },
  'KYC verification': { icon: 'shield', compact: true },
  'Member status': { icon: 'user', compact: true },
  'User activity': { icon: 'activity', compact: true },
  'Organisation registration': { icon: 'building', compact: true },
  'Organisation profiles': { icon: 'building', compact: true },
  'Membership oversight': { icon: 'users', compact: true },
  'Admin appointments': { icon: 'userCheck', compact: true },
  'Organisation status': { icon: 'building', compact: true },
  'Homepage placement': { icon: 'grid', compact: true },
  News: { icon: 'newspaper', compact: true },
  Noticeboard: { icon: 'newspaper', compact: true },
  Categories: { icon: 'tag', compact: true },
  Groups: { icon: 'users', compact: true },
  Moderation: { icon: 'shield', compact: true },
  Reports: { icon: 'chart', compact: true },
  Notices: { icon: 'newspaper', compact: true },
  Safety: { icon: 'shield', compact: true },
  Modules: { icon: 'box', compact: true },
  'Radio & TV': { icon: 'radio', compact: true },
  Learning: { icon: 'cap', compact: true },
  Search: { icon: 'search', compact: true },
  Health: { icon: 'activity', compact: true },
  'Org theme': { icon: 'palette', compact: true },
  Homepage: { icon: 'grid', compact: true },
  Navigation: { icon: 'menu', compact: true },
  Configuration: { icon: 'sliders', compact: true },
  Provincial: { icon: 'globe', compact: true },
  Notifications: { icon: 'bell', compact: true },
  AI: { icon: 'spark', compact: true },
  Offline: { icon: 'wifiOff', compact: true },
  Security: { icon: 'lock', compact: true },
  Backup: { icon: 'database', compact: true },
  'Audit register': { icon: 'list', compact: true },
  Events: { icon: 'calendar', compact: true },
  Approvals: { icon: 'check', compact: true },
  Export: { icon: 'upload', compact: true },
}

function card(title, desc, meta = 'Explore') {
  const tile = CARD_TILES[title]
  const image = tile ? null : imageFor(title)

  let media = ''
  if (tile) {
    const glyph = iconSvg(tile.icon, tile.compact ? 26 : 40)
    const label = tile.label ? `<span class="tile-label">${escapeHtml(tile.label)}</span>` : ''
    media = `<div class="card-media tile${tile.compact ? ' compact' : ''}">${glyph}${label}</div>`
  } else if (image) {
    media = `<div class="card-media"><img src="${image}" alt="" loading="lazy" decoding="async" /></div>`
  }

  return `<article class="content-card${media ? ' has-media' : ''}">${media}<div class="card-body"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p>${cardAction(title, meta)}</div></article>`
}

/**
 * What a card's button does. Category cards open a workspace page, content
 * cards open a detail record, and everything unmapped says so plainly.
 */
function cardAction(title, meta) {
  const link = CARD_LINKS[title]
  const label = `${escapeHtml(meta)} →`
  if (link?.page) {
    return `<button class="text-action" data-action="card-page" data-page-target="${escapeHtml(link.page)}">${label}</button>`
  }
  if (link?.type && link?.id) {
    return `<button class="text-action" data-action="card-detail" data-detail-type="${escapeHtml(link.type)}" data-detail-id="${escapeHtml(link.id)}">${label}</button>`
  }
  return `<button class="text-action" data-action="demo">${label}</button>`
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ── Offline / Online detection ────────────────────────────────────────────

function updateOnlineStatus() {
  state.offline = !navigator.onLine
  render()
}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)

// ── Service worker (offline-first cache) ──────────────────────────────────
// Production builds only: during development a cached shell would serve stale
// modules and mask hot-reload changes.

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // The service worker is an enhancement; the app works without it.
    })
  })
}

// ── Public WebUI content ──────────────────────────────────────────────────

function publicHome() {
  return `
    <section class="hero">
      <div class="eyebrow">WELCOME TO IGIFY</div>
      <h2>Discover. Learn. Connect.</h2>
      <p>A local community space for knowledge, useful services, learning and connection.</p>
      <button class="primary" data-action="discover">Explore IGIFY</button>
    </section>
    <section class="section">
      <div class="section-title"><h2>Featured</h2><span class="muted">Selected IGIFY highlights</span></div>
      <div class="feature-grid">
        ${card('Featured story', 'A lead story selected for the community.')}
        ${card('Learning spotlight', 'Discover practical knowledge and learning resources.')}
        ${card('Community highlight', 'A local initiative or event worth knowing about.')}
      </div>
    </section>
    <section class="section">
      <div class="section-title"><h2>Latest News &amp; Announcements</h2><button class="text-action" data-action="card-page" data-page-target="Latest News">See all →</button></div>
      <div class="feature-grid">
        ${card('Community update', 'Important local news and announcements.')}
        ${card('Learning & opportunity', 'New resources and opportunities to explore.')}
      </div>
    </section>
    <section class="section">
      <div class="section-title"><h2>Explore IGIFY</h2></div>
      <div class="feature-grid">
        ${card('Learn', 'Educational resources and practical skills.')}
        ${card('Discover', 'Explore information, ideas and knowledge.')}
        ${card('Skills & Farming', 'Useful local skills and agricultural knowledge.')}
        ${card('Faith & Family', 'Resources for faith, family and community life.')}
        ${card('Listen & Watch', 'Radio, television and recorded media.')}
        ${card('Community & Events', 'Find local activities and community happenings.')}
      </div>
    </section>
    <section class="section">
      <div class="section-title"><h2>What\'s everyone talking about?</h2></div>
      <div class="feature-grid">
        ${card('Community trending', 'Topics attracting attention in the local community.')}
        ${card('World trending', 'Selected wider-world topics, clearly distinguished.')}
      </div>
    </section>
  `
}

function publicDiscover() {
  return `
    <section class="section">
      <div class="section-title"><h2>Discover</h2><p>Explore the breadth of locally available knowledge, resources and services.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Curated discovery categories</h2></div>
      <div class="feature-grid">
        ${card('Learn', 'Educational resources and practical skills.')}
        ${card('Discover', 'Explore information, ideas and knowledge.')}
        ${card('Skills & Farming', 'Useful local skills and agricultural knowledge.')}
        ${card('Faith & Family', 'Resources for faith, family and community life.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Local knowledge and information</h2></div>
      <div class="feature-grid">
        ${card('History & Archives', 'Offline copies of local government and community records.')}
        ${card('Learning opportunities', 'Courses, workshops and study programs nearby.')}
        ${card('Services', 'Local services and community support.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Media</h2></div>
      <div class="feature-grid">
        ${card('Listen & Watch', 'Radio stations, television channels and recorded media.')}
        ${card('Search IGIFY', 'Search across local content and services.')}
      </div>
    </section>
  `
}

function publicLearn() {
  return `
    <section class="section">
      <div class="section-title"><h2>Learn</h2><p>Educational and practical learning material for all ages.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>School and study</h2></div>
      <div class="feature-grid">
        ${card('Study resources', 'Materials for school and continuing education.')}
        ${card('Exam preparation', 'Practice and revision support.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Practical skills</h2></div>
      <div class="feature-grid">
        ${card('Digital skills', 'Computer basics, internet safety and productivity.')}
        ${card('Skills & Farming', 'Agricultural knowledge and local trades.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Reading and books</h2></div>
      <div class="feature-grid">
        ${card('Digital library', 'Books, articles and documents to read online or offline.')}
        ${card('Faith & Family learning', 'Resources for faith, family and community life.')}
      </div>
    </section>
  `
}

function publicCommunityEvents() {
  return `
    <section class="section">
      <div class="section-title"><h2>Community &amp; Events</h2><p>Local community activity and public information.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Community noticeboard</h2></div>
      <div class="feature-grid">
        ${card('Community announcements', 'Local notices and public information.')}
        ${card('Local initiatives', 'Community-led projects and activities.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Events</h2></div>
      <div class="feature-grid">
        ${card('Upcoming events', 'Local activities and gatherings.')}
        ${card('Learning events', 'Workshops, classes and study groups.')}
        ${card('Faith & Family events', 'Faith and family community gatherings.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Organisations and groups</h2></div>
      <div class="feature-grid">
        ${card('Organisation updates', 'News from approved local organisations.')}
        ${card('Public group information', 'Groups open to community members.')}
      </div>
    </section>
  `
}

// Shared public-news cards, so members see the same public news as guests.
function publicNewsCards() {
  return `${card('Community update', 'Important local news and announcements.')}${card('Education and opportunity', 'New resources and learning opportunities.')}`
}

function publicLatestNews() {
  return `
    <section class="section">
      <div class="section-title"><h2>Latest News</h2><p>Local and provincial news and announcements.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Local and provincial news</h2></div>
      <div class="feature-grid">
        ${publicNewsCards()}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Local services and IGIFY announcements</h2></div>
      <div class="feature-grid">
        ${card('Local services', 'Community services and support.')}
        ${card('IGIFY announcements', 'Official platform notices.')}
        ${card('Organisation notices', 'Updates from approved organisations.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Offline notice</h2></div>
      <p class="muted">This deployment displays content acquired and stored locally. It does not imply that unavailable live internet feeds are current.</p>
    </section>
  `
}

function publicListenWatch() {
  return `
    <section class="section">
      <div class="section-title"><h2>Listen &amp; Watch</h2><p>Unified media discovery destination.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Listen</h2></div>
      <div class="feature-grid">
        ${card('Radio stations', 'Local and community radio.')}
        ${card('Music discovery', 'Music collections and discovery.')}
        ${card('Recorded audio', 'Audio programmes and podcasts.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Watch</h2></div>
      <div class="feature-grid">
        ${card('Television channels', 'Local and community TV.')}
        ${card('Video library', 'Recorded video content.')}
        ${card('Educational video', 'Learning and instructional video.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Playback notice</h2></div>
      <p class="muted">Actual playback depends on the corresponding local service and its availability.</p>
    </section>
  `
}

function publicAbout() {
  return `
    <section class="section">
      <div class="section-title"><h2>About IGIFY</h2><p>What IGIFY is and how it serves your community.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Our purpose</h2></div>
      <p>IGIFY is a local community platform for knowledge, community connection and local digital services.</p>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Access</h2></div>
      <div class="feature-grid">
        ${card('Public browsing', 'Open to all visitors without an account.')}
        ${card('Registered features', 'Some interactive features require registration and approval.')}
        ${card('Local & offline', 'Content remains available when the internet is unavailable.')}
      </div>
    </section>
  `
}

// ── Member WebUI content ──────────────────────────────────────────────────

function memberHome() {
  return `
    <section class="welcome">
      <span class="eyebrow">WELCOME BACK</span>
      <h2>${escapeHtml(state.profile.name)}</h2>
      <p>Pick up where you left off, keep track of your learning and stay connected with your community.</p>
    </section>
    <section class="section">
      <div class="section-title"><h2>Continue where you left off</h2><button class="text-action" data-action="card-page" data-page-target="Continue Learning">View history →</button></div>
      <div class="feature-grid">
        ${card('Your learning', 'Return to your last lesson or saved learning resource.')}
        ${card('Saved resources', 'Books, articles and useful material saved for later.')}
        ${card('Community activity', 'Updates from your groups and organisation.')}
      </div>
    </section>
    <section class="section">
      <div class="section-title"><h2>Latest News &amp; Announcements</h2><a data-action="open-public-news">Public news →</a></div>
      <div class="feature-grid">${publicNewsCards()}</div>
    </section>
    <section class="panel">
      <h2>Messages &amp; activity</h2>
      <p class="muted">Your unread messages, group updates and personal notices will appear here.</p>
    </section>
  `
}

function memberProfile() {
  const p = state.profile
  return `
    <section class="section">
      <div class="section-title"><h2>My Profile</h2><p>View and manage your permitted profile information.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Profile information</h2><button class="primary" data-action="profile">Edit profile</button></div>
      <div class="profile-grid">
        <div class="profile-field"><span class="meta-label">Display name</span><strong>${escapeHtml(p.name)}</strong></div>
        <div class="profile-field"><span class="meta-label">Role</span><strong>${escapeHtml(p.role)}</strong></div>
        <div class="profile-field"><span class="meta-label">Identity</span><strong>${escapeHtml(p.kyc)}</strong></div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Privacy</h2></div>
      <p class="muted">Your private identity and verification information is not exposed publicly.</p>
    </section>
  `
}

function memberContinueLearning() {
  return `
    <section class="section">
      <div class="section-title"><h2>Continue Learning</h2><p>Resume your last lesson or learning resource.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Your learning</h2></div>
      <div class="feature-grid">
        ${card('Last lesson', 'Return to where you left off.')}
        ${card('Recent activity', 'Your recent learning history.')}
        ${card('Progress', 'Track your learning progress when supported.')}
      </div>
    </section>
  `
}

function memberSavedResources() {
  return `
    <section class="section">
      <div class="section-title"><h2>Saved Resources</h2><p>Saved books, articles, documents and lessons.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Your saved items</h2></div>
      <div class="feature-grid">
        ${card('Saved books', 'Books saved for later reading.')}
        ${card('Saved articles', 'Articles and documents.')}
        ${card('Saved lessons', 'Learning resources.')}
      </div>
    </section>
  `
}

function memberMessages() {
  return `
    <section class="section">
      <div class="section-title"><h2>Messages</h2><p>Member messages and unread indicators.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Inbox</h2><button class="text-action" data-action="open-notifications-page">View all →</button></div>
      <div class="feature-grid">
        ${card('Unread messages', 'Messages you have not yet read.')}
        ${card('Conversations', 'Your message threads.')}
        ${card('Group updates', 'Updates from your groups.')}
      </div>
    </section>
    <div class="panel">
      <div class="panel-head"><h2>Notice</h2></div>
      <p class="muted">Messaging is only functional when the approved messaging service is connected.</p>
    </div>
  `
}

function memberMyGroups() {
  return `
    <section class="section">
      <div class="section-title"><h2>My Groups</h2><p>Groups you are permitted to view or participate in.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Your groups</h2><button class="text-action" data-action="open-result" data-kind="record" data-type="groups" data-id="women-in-business">View all →</button></div>
      <div class="feature-grid">
        ${card('Group activity', 'Updates from your groups.')}
        ${card('Membership', 'Your group memberships.')}
        ${card('Participation', 'Post and engage within group rules.')}
      </div>
    </section>
    <div class="panel">
      <div class="panel-head"><h2>Notice</h2></div>
      <p class="muted">Membership and posting actions obey moderation, verification and group rules.</p>
    </div>
  `
}

function memberCommunityEvents() {
  return `
    <section class="section">
      <div class="section-title"><h2>Community &amp; Events</h2><p>Community and event information for members.</p></div>
    </section>
    <section class="panel">
      <h2>Community activity</h2>
      <div class="feature-grid">
        ${card('Community noticeboard', 'Local notices and announcements.')}
        ${card('Local initiatives', 'Community-led projects.')}
        ${card('Upcoming events', 'Local activities and gatherings.')}
      </div>
    </section>
    <section class="panel">
      <h2>Organisations and groups</h2>
      <div class="feature-grid">
        ${card('Organisation updates', 'News from approved organisations.')}
        ${card('Public group information', 'Groups open to community members.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Latest News &amp; Announcements</h2><a data-action="open-public-news">Public news →</a></div>
      <div class="feature-grid">${publicNewsCards()}</div>
    </section>
  `
}

// ── Organisation Admin content ────────────────────────────────────────────

function orgOverview() {
  return `
    <div class="stats">
      <div class="stat"><span>Members</span><b>126</b><small>Sample organisation</small></div>
      <div class="stat"><span>Published items</span><b>18</b><small>Illustrative sample</small></div>
      <div class="stat"><span>Upcoming events</span><b>4</b><small>Illustrative sample</small></div>
    </div>
    <section class="panel">
      <div class="panel-head"><h2>Overview</h2><button class="primary" data-action="create">${iconSvg('plus', 14)} Create</button></div>
      <div class="feature-grid">
        ${card('Pending tasks', 'Your organisation’s pending tasks.')}
        ${card('Recent activity', 'Recent content and event activity.')}
        ${card('Membership summary', 'Membership and activity summaries.')}
      </div>
    </section>
  `
}

function orgProfile() {
  const org = state.orgProfile
  return `
    <section class="section">
      <div class="section-title"><h2>Organisation Profile</h2><p>Maintain your organisation’s public information.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Organisation details</h2><button class="primary" data-action="org-profile-edit">Edit profile</button></div>
      <div class="profile-grid">
        <div class="profile-field"><span class="meta-label">Name</span><strong>${escapeHtml(org.name)}</strong></div>
        <div class="profile-field"><span class="meta-label">About</span><strong>${escapeHtml(org.about)}</strong></div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Review</h2></div>
      <p class="muted">In the completed system, changes to public fields would be submitted for review. In this prototype they save immediately and are recorded in the audit trail.</p>
    </section>
  `
}

function orgProfileModal() {
  const org = state.orgProfile
  const body = `
    <label class="field-label" for="org-name">Organisation name</label>
    <input id="org-name" class="control-input field" maxlength="80" value="${escapeHtml(org.name)}" />
    <label class="field-label" for="org-about">About</label>
    <textarea id="org-about" class="control-input field" rows="3" maxlength="300">${escapeHtml(org.about)}</textarea>
  `
  const foot = `<button class="outline" data-action="close-modal">Cancel</button><button class="primary" data-action="org-profile-save">Save profile</button>`
  return modalShell('Organisation profile', body, foot)
}

function orgMembers() {
  return `
    <section class="section">
      <div class="section-title"><h2>Members</h2><p>View organisation membership within granted permissions.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Membership</h2></div>
      <div class="feature-grid">
        ${card('Members', 'View organisation membership.')}
        ${card('Roles', 'Manage permitted organisation roles or requests.')}
        ${card('Rules', 'Do not bypass IGIFY identity and approval rules.')}
      </div>
      <p class="muted">Role management needs live membership data from the backend, so it is not enabled in this prototype.</p>
    </section>
  `
}

function orgContent() {
  return `
    <section class="section">
      <div class="section-title"><h2>Content</h2><p>Prepare and submit organisation content.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Submissions</h2><button class="primary" data-action="create">${iconSvg('plus', 14)} Create</button></div>
      <div class="feature-grid">
        ${card('Prepare content', 'Prepare organisation content for submission.')}
        ${card('Publishing', 'Publishing approval remains with the authorised editorial process.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Prepared in this prototype</h2></div>
      ${createdList('content', 'No organisation content prepared yet.')}
    </section>
  `
}

function orgEvents() {
  return `
    <section class="section">
      <div class="section-title"><h2>Events</h2><p>Prepare and manage organisation event information.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Events</h2><button class="primary" data-action="create">${iconSvg('plus', 14)} Create</button></div>
      <div class="feature-grid">
        ${card('Manage events', 'Prepare and manage organisation event information.')}
        ${card('Visibility', 'Public visibility follows publishing and moderation rules.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Prepared in this prototype</h2></div>
      ${createdList('events', 'No organisation events prepared yet.')}
    </section>
  `
}

function orgResources() {
  return `
    <section class="section">
      <div class="section-title"><h2>Resources</h2><p>Manage or submit organisation resources within assigned permissions.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Resources</h2><button class="primary" data-action="create">${iconSvg('plus', 14)} Create</button></div>
      <div class="feature-grid">
        ${card('Manage resources', 'Manage organisation resources.')}
        ${card('Permissions', 'Within your assigned permissions.')}
      </div>
    </section>
  `
}

function orgReports() {
  return `
    <section class="section">
      <div class="section-title"><h2>Reports</h2><p>View available organisation activity and engagement summaries.</p></div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Activity summaries</h2><span class="muted">Illustrative sample</span></div>
      <div class="stats">
        <div class="stat"><span>Published items</span><b>18</b><small>Sample</small></div>
        <div class="stat"><span>Event attendance</span><b>240</b><small>Sample</small></div>
        <div class="stat"><span>Resource downloads</span><b>96</b><small>Sample</small></div>
      </div>
      <div class="feature-grid">
        ${card('Engagement', 'View organisation engagement summaries.')}
        ${card('Activity', 'View organisation activity reports.')}
      </div>
    </section>
  `
}

// ── IGIFY Administrator content ───────────────────────────────────────────

function adminDashboard() {
  return `
    <div class="stats">
      <div class="stat"><span>Pending reviews</span><b>12</b><small>Illustrative sample</small></div>
      <div class="stat"><span>Registered members</span><b>1,284</b><small>Illustrative sample</small></div>
      <div class="stat"><span>Organisations</span><b>38</b><small>Illustrative sample</small></div>
      <div class="stat"><span>Services</span><b>14 / 16</b><small>Illustrative sample</small></div>
    </div>
    <section class="panel">
      <div class="panel-head"><h2>Pending attention</h2><button class="outline" data-action="card-page" data-page-target="Content &amp; Editorial">View queue</button></div>
      <div class="row-item"><span>Identity reviews awaiting decision</span><b>7</b></div>
      <div class="row-item"><span>Organisation requests</span><b>3</b></div>
      <div class="row-item"><span>Content awaiting approval</span><b>2</b></div>
    </section>
    <section class="panel">
      <h2>Administrative announcements</h2>
      <p class="muted">Important platform notices and operational updates will appear here.</p>
    </section>
  `
}

function adminUsersIdentity() {
  return `
    <section class="panel">
      <div class="panel-head"><h2>Users &amp; Identity</h2><button class="primary" data-action="create">${iconSvg('plus', 14)} Register user</button></div>
      <div class="feature-grid">
        ${card('User directory', 'User directory and profile management.')}
        ${card('Registration review', 'Registration and account review.')}
        ${card('KYC verification', 'KYC verification and approval.')}
        ${card('Member status', 'Member status and restrictions.')}
        ${card('User activity', 'User activity and history.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Created in this prototype</h2></div>
      ${createdList('users', 'No users registered in this prototype yet. Use the Register user button.')}
    </section>
  `
}

function adminOrganisations() {
  return `
    <section class="panel">
      <div class="panel-head"><h2>Organisations</h2><button class="primary" data-action="create">${iconSvg('plus', 14)} Register organisation</button></div>
      <div class="feature-grid">
        ${card('Organisation registration', 'Organisation registration and approval.')}
        ${card('Organisation profiles', 'Organisation profiles and records.')}
        ${card('Membership oversight', 'Membership oversight.')}
        ${card('Admin appointments', 'Organisation Admin appointments and approvals.')}
        ${card('Organisation status', 'Organisation status and review.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Created in this prototype</h2></div>
      ${createdList('organisations', 'No organisations registered in this prototype yet.')}
    </section>
  `
}

function adminContentEditorial() {
  return `
    <section class="panel">
      <div class="panel-head"><h2>Content &amp; Editorial</h2><button class="primary" data-action="create">${iconSvg('plus', 14)} Create</button></div>
      <div class="feature-grid">
        ${card('Publishing', 'Content publishing and approval.')}
        ${card('Homepage placement', 'Homepage featured and editorial placement.')}
        ${card('News', 'News and announcements.')}
        ${card('Noticeboard', 'Noticeboard and community events.')}
        ${card('Categories', 'Categories, tags and expiry.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Content drafted in this prototype</h2></div>
      ${createdList('content', 'No content drafted in this prototype yet.')}
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Announcements drafted in this prototype</h2></div>
      ${createdList('announcements', 'No announcements drafted in this prototype yet.')}
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Events drafted in this prototype</h2></div>
      ${createdList('events', 'No events drafted in this prototype yet.')}
    </section>
  `
}

function adminCommunitySafety() {
  return `
    <section class="panel">
      <div class="panel-head"><h2>Community &amp; Safety</h2><button class="primary" data-action="create">${iconSvg('plus', 14)} Create group</button></div>
      <div class="feature-grid">
        ${card('Groups', 'Groups and membership oversight.')}
        ${card('Moderation', 'Discussion and comment moderation.')}
        ${card('Reports', 'Reports, complaints and flagged content.')}
        ${card('Notices', 'Community notices and announcements.')}
        ${card('Safety', 'Safety controls.')}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Groups created in this prototype</h2></div>
      ${createdList('groups', 'No groups created in this prototype yet.')}
    </section>
  `
}

function adminModulesServices() {
  const overrides = state.services || {}
  const rows = SERVICES.map((service) => {
    const status = overrides[service.id]?.status || service.status
    return `<li class="service-row">
      <button class="record-link" data-action="open-service" data-id="${escapeHtml(service.id)}">${escapeHtml(service.name)}</button>
      <span class="service-meta">${escapeHtml(service.category)} · ${escapeHtml(HEALTH_LABELS[service.health])}</span>
      <span class="status status-${status === 'enabled' ? 'approved' : 'draft'}">${escapeHtml(SERVICE_STATUS_LABELS[status])}</span>
    </li>`
  }).join('')

  return `
    <section class="panel">
      <div class="panel-head"><h2>Services</h2><span class="muted">${SERVICES.length} configured</span></div>
      <ul class="service-list">${rows}</ul>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Notes</h2></div>
      <p class="muted">Health and availability are illustrative in this prototype. Real values would come from the Service Integration Layer described in the design baseline.</p>
    </section>
  `
}

function adminAppearanceInterface() {
  const themeChoices = Object.entries(themeNames)
    .map(([key, label]) => `<option value="${key}" ${state.theme === key && !state.dark ? 'selected' : ''}>${escapeHtml(label)}</option>`)
    .join('')

  return `
    <section class="panel">
      <div class="panel-head"><h2>Appearance &amp; Interface</h2></div>
      <div class="appearance-controls">
        <div class="control-row">
          <div>
            <strong>Light theme allocation</strong>
            <p class="muted">Administrator-controlled light theme for this audience.</p>
          </div>
          <select id="theme-choice" class="control-input" aria-label="Choose light theme">
            ${themeChoices}
          </select>
        </div>
        <div class="control-row">
          <div>
            <strong>Dark Mode</strong>
            <p class="muted">Independent of the five light themes. The Organisation Admin workspace keeps its own fixed theme.</p>
          </div>
          <button class="outline" data-action="toggle-dark" aria-pressed="${state.dark}">${state.dark ? 'On' : 'Off'}</button>
        </div>
        <div class="control-row">
          <div>
            <strong>Organisation Admin theme</strong>
            <p class="muted">One fixed cool-charcoal theme shared by every Organisation Admin dashboard. Not controlled by the light theme allocation or by Dark Mode.</p>
          </div>
          <button class="outline" data-action="preview-org">Preview</button>
        </div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Interface settings</h2></div>
      <div class="feature-grid">
        ${card('Org theme', 'Organisation Admin dashboard theme.')}
        ${card('Homepage', 'Homepage appearance and layout.')}
        ${card('Navigation', 'Navigation and interface settings.')}
      </div>
    </section>
  `
}

function adminPlatformSystem() {
  return `
    <section class="panel">
      <div class="panel-head"><h2>Platform &amp; System</h2><span class="muted">Read-only in this prototype</span></div>
      <div class="feature-grid">
        ${card('Configuration', 'General platform configuration.')}
        ${card('Provincial', 'Local provincial settings.')}
        ${card('Notifications', 'Notifications and communications.')}
        ${card('AI', 'AI / Ask AI configuration.')}
        ${card('Offline', 'Offline content and synchronisation.')}
        ${card('Security', 'Security and access monitoring.')}
        ${card('Health', 'System health and service status.')}
        ${card('Backup', 'Backup and recovery.')}
      </div>
    </section>
  `
}

function adminAuditActivity() {
  const events = state.audit || []
  const rows = events
    .slice(0, 60)
    .map(
      (event) => `<li class="audit-row">
        <button class="record-link" data-action="open-audit" data-id="${escapeHtml(event.id)}">${escapeHtml(event.action)}</button>
        <span class="audit-meta">${escapeHtml(event.actor)} · ${escapeHtml(formatTime(event.at))}${event.target?.title ? ` · ${escapeHtml(event.target.title)}` : ''}</span>
      </li>`
    )
    .join('')

  return `
    <section class="panel">
      <div class="panel-head"><h2>Audit register</h2><span class="muted">${events.length} event${events.length === 1 ? '' : 's'}</span></div>
      ${rows ? `<ul class="audit-list">${rows}</ul>` : '<p class="muted">No audit events yet. Create a record or change its status to produce one.</p>'}
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Audit controls</h2></div>
      <div class="feature-grid">
        ${card('Events', 'Actor, timestamp, action, category and outcome.')}
        ${card('Approvals', 'Approval and publishing events.')}
        ${card('Export', 'Exportable audit records where authorised.')}
      </div>
    </section>
  `
}

/** Single audit event. */
function auditDetailView(event) {
  const target = event.target || {}
  return `<div class="detail-wrap">
    <button class="back-link" data-action="detail-back">${iconSvg('arrowLeft', 16)} Back to ${escapeHtml(state.page)}</button>
    <section class="panel">
      <div class="panel-head"><h2>${escapeHtml(event.action)}</h2><span class="status status-approved">${escapeHtml(event.outcome || 'success')}</span></div>
      <div class="record-meta">
        <div><span class="meta-label">Actor</span><span>${escapeHtml(event.actor || 'Unknown')}</span></div>
        <div><span class="meta-label">When</span><span>${escapeHtml(formatTime(event.at))}</span></div>
        <div><span class="meta-label">Target</span><span>${escapeHtml(target.title || target.id || '—')}${target.collection ? ` (${escapeHtml(target.collection)})` : ''}</span></div>
        <div><span class="meta-label">Note</span><span>${escapeHtml(event.note || '—')}</span></div>
        <div><span class="meta-label">Event ID</span><span>${escapeHtml(event.id)}</span></div>
      </div>
    </section>
  </div>`
}

// ── Content router ────────────────────────────────────────────────────────

const adminPages = {
  Dashboard: adminDashboard,
  'Users & Identity': adminUsersIdentity,
  Organisations: adminOrganisations,
  'Content & Editorial': adminContentEditorial,
  'Community & Safety': adminCommunitySafety,
  'Modules & Services': adminModulesServices,
  'Appearance & Interface': adminAppearanceInterface,
  'Platform & System': adminPlatformSystem,
  'Audit & Activity': adminAuditActivity,
}

const orgPages = {
  Overview: orgOverview,
  'Organisation Profile': orgProfile,
  Members: orgMembers,
  Content: orgContent,
  Events: orgEvents,
  Resources: orgResources,
  Reports: orgReports,
}

const memberPages = {
  Home: memberHome,
  'My Profile': memberProfile,
  'Continue Learning': memberContinueLearning,
  'Saved Resources': memberSavedResources,
  Messages: memberMessages,
  'My Groups': memberMyGroups,
  'Community & Events': memberCommunityEvents,
}

const publicPages = {
  Home: publicHome,
  Discover: publicDiscover,
  Learn: publicLearn,
  'Community & Events': publicCommunityEvents,
  'Latest News': publicLatestNews,
  'Listen & Watch': publicListenWatch,
  'About IGIFY': publicAbout,
}

function contentFor(env, page) {
  const pageMaps = { admin: adminPages, org: orgPages, member: memberPages, public: publicPages }
  const fn = pageMaps[env]?.[page]
  if (fn) return fn()
  return `<section class="panel"><div class="panel-head"><h2>${escapeHtml(page)}</h2><p class="muted">${escapeHtml(environments[env].label)} workspace · demonstration content</p></div></section>`
}

// ── Local prototype flows: profile, notifications, create ─────────────────

const CREATE_TYPES = {
  user: { label: 'Register a user', page: 'Users & Identity', collection: 'users', status: 'pending' },
  organisation: { label: 'Register an organisation', page: 'Organisations', collection: 'organisations', status: 'pending' },
  content: { label: 'Create content', page: 'Content & Editorial', collection: 'content', status: 'draft' },
  announcement: { label: 'Publish an announcement', page: 'Content & Editorial', collection: 'announcements', status: 'draft' },
  group: { label: 'Create a community group', page: 'Community & Safety', collection: 'groups', status: 'pending' },
  event: { label: 'Create an event', page: 'Content & Editorial', collection: 'events', status: 'draft' },
}

function unreadCount() {
  return state.notifications.filter((n) => !n.read).length
}

function addNotification(title, body) {
  state.notifications = store.addNotification({ title, body })
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return ''
  }
}

function initial(value) {
  return escapeHtml(String(value || 'U').trim().slice(0, 1).toUpperCase() || 'U')
}

function createdList(collection, emptyText) {
  const list = state.items[collection] || []
  if (!list.length) return `<p class="muted">${escapeHtml(emptyText)}</p>`
  return `<ul class="created-list">${list
    .map(
      (item) => `<li>
        <div>
          <button class="record-link" data-action="open-record" data-collection="${escapeHtml(collection)}" data-id="${escapeHtml(item.id)}">${escapeHtml(item.title)}</button>
          ${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ''}
        </div>
        <small><span class="status status-${escapeHtml(item.status)}">${escapeHtml(STATUS_LABELS[item.status] || item.status)}</span> · ${escapeHtml(formatTime(item.at))}</small>
      </li>`
    )
    .join('')}</ul>`
}

function modalShell(title, bodyHtml, footerHtml = '') {
  return `<div class="modal-overlay" data-action="close-modal">
    <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="modal-head">
        <h2>${escapeHtml(title)}</h2>
        <button class="icon-btn" data-action="close-modal" aria-label="Close">${iconSvg('close', 18)}</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      ${footerHtml ? `<div class="modal-foot">${footerHtml}</div>` : ''}
    </div>
  </div>`
}

function profileModal() {
  const p = state.profile
  const body = `
    <div class="modal-avatar">${initial(p.name)}</div>
    <label class="field-label" for="profile-name">Display name</label>
    <input id="profile-name" class="control-input field" value="${escapeHtml(p.name)}" maxlength="60" />
    <div class="profile-meta">
      <div><span class="meta-label">Role</span><span>${escapeHtml(p.role)}</span></div>
      <div><span class="meta-label">Identity</span><span>${escapeHtml(p.kyc)}</span></div>
    </div>
    <p class="muted">Prototype only — the backend enforces identity and verification.</p>
  `
  const foot = `<button class="outline" data-action="close-modal">Cancel</button><button class="primary" data-action="save-profile">Save profile</button>`
  return modalShell('Account', body, foot)
}

function notificationsModal() {
  const list = state.notifications
  const body = list.length
    ? `<ul class="notif-list">${list
        .map(
          (n) => `<li class="${n.read ? '' : 'unread'}">
            <span class="notif-dot" aria-hidden="true"></span>
            <div>
              <strong>${escapeHtml(n.title)}</strong>
              <p>${escapeHtml(n.body)}</p>
              <small>${escapeHtml(formatTime(n.at))}</small>
            </div>
          </li>`
        )
        .join('')}</ul>`
    : `<p class="muted">No notifications.</p>`
  const foot = `<button class="outline" data-action="open-notifications-page">View all</button><button class="outline" data-action="clear-notifications">Clear all</button><button class="primary" data-action="mark-all-read">Mark all read</button>`
  return modalShell('Notifications', body, foot)
}

function createModal() {
  const options = Object.entries(CREATE_TYPES)
    .map(
      ([key, t]) =>
        `<button class="create-option" data-action="choose-create" data-type="${key}"><strong>${escapeHtml(t.label)}</strong></button>`
    )
    .join('')
  return modalShell(
    'Create',
    `<p class="muted">Create a new item. It is saved on this device for the prototype.</p><div class="create-grid">${options}</div>`
  )
}

function createFormModal() {
  const t = CREATE_TYPES[state.createType]
  if (!t) return createModal()
  const body = `
    <label class="field-label" for="create-title">Title</label>
    <input id="create-title" class="control-input field" maxlength="90" placeholder="${escapeHtml(t.label)}" />
    <label class="field-label" for="create-detail">Details (optional)</label>
    <textarea id="create-detail" class="control-input field" rows="3" maxlength="300"></textarea>
    <p class="muted">Saved as <strong>${escapeHtml(t.status)}</strong> and listed under ${escapeHtml(t.page)}.</p>
  `
  const foot = `<button class="outline" data-action="back-to-create">Back</button><button class="primary" data-action="submit-create">Save</button>`
  return modalShell(t.label, body, foot)
}

function creditsModal() {
  const items = Object.entries(photoCredits)
    .map(([module, c]) => {
      const source = c.source
        ? ` · <a href="${escapeHtml(c.source)}" target="_blank" rel="noopener noreferrer">source</a>`
        : ''
      return `<li>
        <strong>${escapeHtml(module)}</strong>
        <p>${escapeHtml(c.title || '')}</p>
        <small>${escapeHtml(c.creator || 'Unknown')} · ${escapeHtml(c.license || '')}${source}</small>
      </li>`
    })
    .join('')
  const body = `<p class="muted">Photographs are used under their stated licences. The CC BY and CC BY-SA images require attribution, which this panel provides.</p><ul class="notif-list credits-list">${items}</ul>`
  return modalShell('Photo credits', body)
}

function closeModal() {
  state.modal = null
  state.createType = null
  render()
}

function saveProfile() {
  const input = document.querySelector('#profile-name')
  const name = (input?.value || '').trim()
  if (!name) {
    notify('Enter a display name first.')
    input?.focus()
    return
  }
  state.profile = store.updateProfile({ name })
  state.modal = null
  render()
  notify('Profile saved on this device.')
}

function submitCreate() {
  const t = CREATE_TYPES[state.createType]
  if (!t) return
  const titleEl = document.querySelector('#create-title')
  const detailEl = document.querySelector('#create-detail')
  const title = (titleEl?.value || '').trim()
  if (!title) {
    notify('Enter a title first.')
    titleEl?.focus()
    return
  }
  const detail = (detailEl?.value || '').trim()
  store.createRecord(t.collection, { title, detail, status: t.status, actor: state.profile.name })
  state.items = store.allRecords()
  state.audit = store.listAudit()
  addNotification(`${t.label} saved`, `${title} — ${(STATUS_LABELS[t.status] || t.status).toLowerCase()}.`)

  // Stay inside the Organisation Admin workspace for its own content and events.
  const orgTarget = state.env === 'org' && (state.createType === 'content' || state.createType === 'event')
  if (orgTarget) {
    state.page = state.createType === 'content' ? 'Content' : 'Events'
  } else {
    state.env = 'admin'
    state.page = t.page
  }

  state.modal = null
  state.createType = null
  saveState()
  render()
  notify(`${title} added to ${state.page}.`)
}

// ── Render ────────────────────────────────────────────────────────────────

/** Locate a record created in this prototype, with its collection. */
const COLLECTION_LABELS = {
  users: 'Users',
  organisations: 'Organisations',
  content: 'Content',
  announcements: 'Announcements',
  groups: 'Groups',
  events: 'Events',
}

function findCreatedRecord(id) {
  for (const [collection, items] of Object.entries(state.items)) {
    const record = (items || []).find((item) => item.id === id)
    if (record) return { record, collection }
  }
  return null
}

/** Draft / approval screen for records created in this prototype. */
function recordView({ record, collection }) {
  const isEditorial = ['content', 'announcements', 'events'].includes(collection)
  const actions = actionsFor(record.status, state.env, collection)
  const editable = isEditorial && isEditable(record.status)

  const actionButtons = actions
    .map((to) => {
      const style = to === 'rejected' ? 'outline danger' : to === 'draft' ? 'outline' : 'primary'
      return `<button class="${style}" data-action="record-transition" data-collection="${escapeHtml(collection)}" data-id="${escapeHtml(record.id)}" data-to="${escapeHtml(to)}">${escapeHtml(ACTION_LABELS[to] || to)}</button>`
    })
    .join('')

  const editor = editable
    ? `<div class="record-editor">
        <label class="field-label" for="record-title">Title</label>
        <input id="record-title" class="control-input field" maxlength="90" value="${escapeHtml(record.title)}" />
        <label class="field-label" for="record-detail">Details</label>
        <textarea id="record-detail" class="control-input field" rows="4" maxlength="600">${escapeHtml(record.detail || '')}</textarea>
        <div class="record-actions">
          <button class="outline" data-action="record-save" data-collection="${escapeHtml(collection)}" data-id="${escapeHtml(record.id)}">Save changes</button>
          ${actionButtons}
        </div>
      </div>`
    : `<div class="record-readonly">
        ${record.detail ? `<p class="detail-text"><span>${escapeHtml(record.detail)}</span></p>` : '<p class="muted">No details were provided.</p>'}
        ${actionButtons ? `<div class="record-actions">${actionButtons}</div>` : ''}
      </div>`

  const history = (record.history || [])
    .slice()
    .reverse()
    .map(
      (h) => `<li>
        <span class="history-dot" aria-hidden="true"></span>
        <div>
          <strong>${escapeHtml(STATUS_LABELS[h.to] || h.to)}</strong>
          <small>${escapeHtml(h.actor || 'Unknown')} · ${escapeHtml(formatTime(h.at))}${h.note ? ` · ${escapeHtml(h.note)}` : ''}</small>
        </div>
      </li>`
    )
    .join('')

  return `<div class="detail-wrap">
    <button class="back-link" data-action="detail-back">${iconSvg('arrowLeft', 16)} Back to ${escapeHtml(state.page)}</button>
    <section class="panel record-panel">
      <div class="panel-head">
        <h2>${escapeHtml(record.title)}</h2>
        <span class="status status-${escapeHtml(record.status)}">${escapeHtml(STATUS_LABELS[record.status] || record.status)}</span>
      </div>
      <div class="record-meta">
        <div><span class="meta-label">Collection</span><span>${escapeHtml(COLLECTION_LABELS[collection] || collection)}</span></div>
        <div><span class="meta-label">Created</span><span>${escapeHtml(formatTime(record.at))}</span></div>
        <div><span class="meta-label">Updated</span><span>${escapeHtml(formatTime(record.updatedAt || record.at))}</span></div>
        <div><span class="meta-label">Version</span><span>${escapeHtml(String(record.version || 1))}</span></div>
      </div>
      ${editor}
      ${actions.includes('rejected') || actions.includes('submitted') ? `<label class="field-label" for="record-note">Review note (optional)</label><input id="record-note" class="control-input field" maxlength="200" placeholder="Reason or comment" />` : ''}
    </section>
    <section class="panel">
      <div class="panel-head"><h2>History</h2></div>
      <ul class="record-history">${history || '<li><small>No history yet.</small></li>'}</ul>
    </section>
  </div>`
}

/** Full notification history. */
function notificationsPage() {
  const list = state.notifications || []
  const unread = list.filter((n) => !n.read).length

  if (!list.length) {
    return `<section class="panel">
      <div class="panel-head"><h2>Notifications</h2><span class="muted">0</span></div>
      <p class="muted">No notifications. Activity such as a record being approved will appear here.</p>
    </section>`
  }

  const rows = list
    .map(
      (n) => `<li class="${n.read ? '' : 'unread'}">
        <span class="notif-dot" aria-hidden="true"></span>
        <div>
          <strong>${escapeHtml(n.title)}</strong>
          <p>${escapeHtml(n.body)}</p>
          <small>${escapeHtml(formatTime(n.at))}</small>
        </div>
      </li>`
    )
    .join('')

  return `<section class="panel">
    <div class="panel-head"><h2>Notifications</h2><span class="muted">${unread} unread · ${list.length} total</span></div>
    <div class="notif-actions">
      <button class="outline" data-action="mark-all-read">Mark all read</button>
      <button class="outline danger" data-action="clear-notifications">Clear all</button>
    </div>
    <ul class="notif-list">${rows}</ul>
  </section>`
}

/** Single service record. */
function serviceDetailView(service) {
  const override = (state.services || {})[service.id]
  const status = override?.status || service.status
  const next = status === 'enabled' ? 'disabled' : 'enabled'

  return `<div class="detail-wrap">
    <button class="back-link" data-action="detail-back">${iconSvg('arrowLeft', 16)} Back to ${escapeHtml(state.page)}</button>
    <section class="panel">
      <div class="panel-head"><h2>${escapeHtml(service.name)}</h2><span class="status status-${status === 'enabled' ? 'approved' : 'draft'}">${escapeHtml(SERVICE_STATUS_LABELS[status])}</span></div>
      <div class="record-meta">
        <div><span class="meta-label">Category</span><span>${escapeHtml(service.category)}</span></div>
        <div><span class="meta-label">Health</span><span>${escapeHtml(HEALTH_LABELS[service.health])}</span></div>
        ${override?.updatedAt ? `<div><span class="meta-label">Changed</span><span>${escapeHtml(formatTime(override.updatedAt))}</span></div>` : ''}
      </div>
      <div class="record-editor">
        <p class="muted">${escapeHtml(service.description)}</p>
        <p class="muted">Health is illustrative in this prototype. Real values would come from the Service Integration Layer.</p>
        <div class="record-actions">
          <button class="${next === 'disabled' ? 'outline danger' : 'primary'}" data-action="service-toggle" data-id="${escapeHtml(service.id)}" data-to="${next}">${next === 'disabled' ? 'Disable service' : 'Enable service'}</button>
        </div>
      </div>
    </section>
  </div>`
}

/** Search results screen. */
function searchPage(query) {
  const q = String(query || '').trim()

  if (!q) {
    return `<section class="panel">
      <div class="panel-head"><h2>Search IGIFY</h2></div>
      <p class="muted">Type a term in the field above — for example “coffee”, “school”, “church” or “event”.</p>
      <p class="muted">Search covers the demonstration content and the workspace pages. It is not yet connected to Migle.</p>
    </section>`
  }

  const results = searchAll(q, environments)

  if (!results.length) {
    return `<section class="panel">
      <div class="panel-head"><h2>No results</h2></div>
      <p class="muted">Nothing matches “${escapeHtml(q)}”. Try a broader term.</p>
    </section>`
  }

  const rows = results
    .map(
      (r) => `<li class="result">
        <span class="result-badge">${escapeHtml(r.typeLabel)}</span>
        <button class="result-title" data-action="open-result"
          data-kind="${escapeHtml(r.kind)}"
          data-type="${escapeHtml(r.type || '')}"
          data-id="${escapeHtml(r.id || '')}"
          data-env="${escapeHtml(r.env || '')}"
          data-page="${escapeHtml(r.page || '')}">${escapeHtml(r.title)}</button>
        <p class="result-snippet">${escapeHtml(r.snippet)}</p>
      </li>`
    )
    .join('')

  return `<section class="panel">
    <div class="panel-head"><h2>${results.length} result${results.length === 1 ? '' : 's'}</h2><span class="muted">for “${escapeHtml(q)}”</span></div>
    <ul class="search-results">${rows}</ul>
  </section>`
}

/** One reusable detail layout for every record type. */
function detailView(item, page) {
  const meta = (item.meta || [])
    .map(
      (m) =>
        `<div><span class="meta-label">${escapeHtml(m.label)}</span><span>${escapeHtml(m.value)}</span></div>`
    )
    .join('')

  return `<div class="detail-wrap">
    <button class="back-link" data-action="detail-back">${iconSvg('arrowLeft', 16)} Back to ${escapeHtml(page)}</button>
    <article class="detail">
      ${item.image ? `<div class="detail-media"><img src="${escapeHtml(item.image)}" alt="" /></div>` : ''}
      <div class="detail-content">
        <div class="eyebrow">${escapeHtml(TYPE_LABELS[item.type] || 'Record')}</div>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="detail-summary">${escapeHtml(item.summary || '')}</p>
        ${meta ? `<div class="detail-meta">${meta}</div>` : ''}
        ${item.sample ? '<p class="sample-note">Demonstration content — not IGIFY editorial material.</p>' : ''}
        <div class="detail-text">${(item.body || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>
      </div>
    </article>
  </div>`
}

function render() {
  const e = environments[state.env]

  // A stale or hand-edited detail route should fall back to the page, not blank.
  const isRecordDetail = state.detail?.type === 'record'
  const created = isRecordDetail ? findCreatedRecord(state.detail.id) : null
  if (isRecordDetail && !created) state.detail = null

  const record = !isRecordDetail && state.detail ? findRecord(state.detail.type, state.detail.id) : null
  if (!isRecordDetail && state.detail && !record) state.detail = null

  const auditEvent =
    state.detail?.type === 'audit'
      ? (state.audit || []).find((event) => event.id === state.detail.id)
      : null
  if (state.detail?.type === 'audit' && !auditEvent) state.detail = null

  const service = state.detail?.type === 'service' ? findService(state.detail.id) : null
  if (state.detail?.type === 'service' && !service) state.detail = null

  const isSearch = !record && !created && !auditEvent && !service && state.page === 'Search'
  const isNotifications = !record && !created && !auditEvent && !service && state.page === 'Notifications'
  const heading = service
    ? { eyebrow: 'SERVICE', title: service.name, subtitle: service.description }
    : auditEvent
    ? { eyebrow: 'AUDIT EVENT', title: auditEvent.action, subtitle: auditEvent.note || 'Recorded administrative event.' }
    : created
    ? {
        eyebrow: 'CONTENT RECORD',
        title: created.record.title,
        subtitle: created.record.detail || 'Record created in this prototype.',
      }
    : record
      ? {
          eyebrow: TYPE_LABELS[record.type] || 'RECORD',
          title: record.title,
          subtitle: record.summary || '',
        }
      : isSearch
        ? {
            eyebrow: 'SEARCH IGIFY',
            title: 'Search',
            subtitle: state.search ? `Results for “${state.search}”` : 'Search pages and content.',
          }
        : {
            eyebrow: e.label.toUpperCase(),
            title: state.page === 'Home' ? e.title : state.page,
            subtitle: e.subtitle,
          }

  // Organisation Admin has its own fixed theme, unaffected by light allocation or Dark Mode.
  document.documentElement.dataset.theme = state.env === 'org' ? 'org' : state.dark ? 'dark' : state.theme
  document.documentElement.dataset.sidebar = state.sidebar ? 'open' : 'closed'

  const nav = e.nav
    .map(
      (n) =>
        `<button class="nav-link ${state.page === n ? 'active' : ''}" data-page="${escapeHtml(n)}" data-label="${escapeHtml(n)}" aria-pressed="${state.page === n}"><span>${icon(n)}</span><label>${escapeHtml(n)}</label></button>`
    )
    .join('')

  const themeOptions = Object.entries(themeNames)
    .map(
      ([key, label]) =>
        `<option value="${key}" ${state.theme === key ? 'selected' : ''}>${escapeHtml(label)}</option>`
    )
    .join('')

  const wide = window.matchMedia('(min-width: 700px)').matches

  // In the collapsed desktop rail the workspace selector is replaced by an
  // expand control, because a native select cannot be rendered as an icon.
  const workspaceControl =
    wide && state.collapsed
      ? `<button class="rail-btn" data-action="expand-sidebar" title="Change workspace" aria-label="Change workspace">${iconSvg('grid', 18)}</button>`
      : [
          '<div class="env-label">WORKSPACE</div>',
          '<select id="environment" aria-label="Choose workspace">',
          `<option value="public" ${state.env === 'public' ? 'selected' : ''}>Public WebUI</option>`,
          `<option value="member" ${state.env === 'member' ? 'selected' : ''}>Registered Member</option>`,
          `<option value="org" ${state.env === 'org' ? 'selected' : ''}>Organisation Admin</option>`,
          `<option value="admin" ${state.env === 'admin' ? 'selected' : ''}>IGIFY Administrator</option>`,
          '</select>',
        ].join('')

  document.querySelector('#app').innerHTML = `
    <div class="app-shell ${state.sidebar ? '' : 'sidebar-hidden'} ${wide && state.collapsed ? 'sidebar-collapsed' : ''}">
      ${!wide && state.sidebar ? '<div class="drawer-backdrop" data-action="sidebar" aria-hidden="true"></div>' : ''}
      <aside class="sidebar" aria-label="Workspace navigation">
        <div class="brand">
          <div class="brand-mark">i</div>
          <div>
            <strong>IGIFY</strong>
            <small>Discover. Learn. Connect.</small>
          </div>
        </div>
        ${workspaceControl}
        <nav>${nav}</nav>
        <div class="sidebar-bottom">
          <span class="status-dot ${state.offline ? '' : 'online'}"></span>
          Prototype environment <small>v1.0 · sample data</small>
        </div>
      </aside>
      <main class="main">
        ${state.offline ? '<div class="offline-banner show">● Offline — content served from local cache</div>' : ''}
        <header class="topbar">
          <button class="icon-btn menu-btn" data-action="sidebar" aria-label="${wide ? (state.collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Toggle navigation'}" title="${wide ? (state.collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Menu'}">${iconSvg('menu', 20)}</button>
          <div class="breadcrumb">${escapeHtml(e.label)} <span>/</span> ${escapeHtml(state.page)}${record || created || auditEvent ? ` <span>/</span> ${escapeHtml(auditEvent ? auditEvent.action : (created || record).record?.title || record?.title || '')}` : ''}</div>
          <div class="top-actions">
            <div class="search" role="search" aria-label="Search IGIFY">
              ${iconSvg('search', 16)}
              <input id="search" placeholder="Search IGIFY" value="${escapeHtml(state.search)}" />
            </div>
            <button class="icon-btn bell" data-action="notifications" title="Notifications" aria-label="Notifications${unreadCount() ? ` (${unreadCount()} unread)` : ''}">${iconSvg('bell', 18)}${unreadCount() ? `<span class="badge">${unreadCount()}</span>` : ''}</button>
            <button class="profile" data-action="profile" aria-label="Account">${initial(state.profile.name)}</button>
            <button class="icon-btn" data-action="theme-settings" title="Appearance &amp; themes">${iconSvg('sun', 18)}</button>
          </div>
        </header>
        <div class="page-wrap">
          <div class="page-heading">
            <div>
              <div class="eyebrow">${escapeHtml(heading.eyebrow)}</div>
              <h1>${escapeHtml(heading.title)}</h1>
              <p>${escapeHtml(heading.subtitle)}</p>
            </div>
            ${state.env === 'admin' && !record && !created && !isSearch && !isNotifications && !service ? `<button class="primary create-top" data-action="create">${iconSvg('plus', 14)} Create</button>` : ''}
          </div>
          ${service ? serviceDetailView(service) : auditEvent ? auditDetailView(auditEvent) : created ? recordView(created) : record ? detailView(record, state.page) : isSearch ? searchPage(state.search) : isNotifications ? notificationsPage() : contentFor(state.env, state.page)}
          <footer>
            IGIFY WebUI Prototype v1.1
            <span>Frontend demonstration · Not connected to production services</span>
            <button class="link-btn" data-action="credits">Photo credits</button>
          </footer>
        </div>
      </main>
      ${state.modal === 'profile' ? profileModal() : ''}
      ${state.modal === 'notifications' ? notificationsModal() : ''}
      ${state.modal === 'create' ? createModal() : ''}
      ${state.modal === 'create-form' ? createFormModal() : ''}
      ${state.modal === 'credits' ? creditsModal() : ''}
      ${state.modal === 'org-profile' ? orgProfileModal() : ''}
      <div class="toast ${state.toast ? 'show' : ''}" role="status" aria-live="polite">${escapeHtml(state.toast)}</div>
    </div>
  `

  // ── Event listeners ─────────────────────────────────────────────

  const envSelect = document.querySelector('#environment')
  if (envSelect) {
    envSelect.addEventListener('change', (ev) => {
      const env = ev.target.value
      if (!window.matchMedia('(min-width: 700px)').matches) state.sidebar = false
      go({ env, page: environments[env].nav[0] })
    })
  }

  document.querySelectorAll('[data-page]').forEach((b) => {
    b.addEventListener('click', () => {
      // On small screens the drawer should close once a destination is chosen.
      if (!window.matchMedia('(min-width: 700px)').matches) state.sidebar = false
      go({ env: state.env, page: b.dataset.page })
    })
  })

  document.querySelectorAll('[data-action]').forEach((b) => {
    b.addEventListener('click', (ev) => {
      const a = b.dataset.action
      if (a === 'sidebar') {
        if (window.matchMedia('(min-width: 700px)').matches) {
          state.collapsed = !state.collapsed
        } else {
          state.sidebar = !state.sidebar
        }
        saveState()
        render()
      } else if (a === 'expand-sidebar') {
        state.collapsed = false
        saveState()
        render()
      } else if (a === 'create') {
        state.modal = 'create'
        state.createType = null
        render()
      } else if (a === 'discover') {
        go({ env: state.env, page: 'Discover' })
      } else if (a === 'open-public-news') {
        go({ env: 'public', page: 'Latest News' })
      } else if (a === 'card-page') {
        go({ env: state.env, page: b.dataset.pageTarget })
      } else if (a === 'card-detail') {
        go({
          env: state.env,
          page: state.page,
          detail: { type: b.dataset.detailType, id: b.dataset.detailId },
        })
      } else if (a === 'detail-back') {
        go({ env: state.env, page: state.page, detail: null })
      } else if (a === 'open-result') {
        if (b.dataset.kind === 'page') {
          go({ env: b.dataset.env, page: b.dataset.page })
        } else {
          const type = b.dataset.type
          const targetPage = TYPE_PAGE[type] || 'Home'
          const env = environments[state.env].nav.includes(targetPage) ? state.env : 'public'
          go({ env, page: targetPage, detail: { type, id: b.dataset.id } })
        }
      } else if (a === 'open-notifications-page') {
        go({ env: state.env, page: 'Notifications' })
      } else if (a === 'open-service') {
        go({ env: state.env, page: state.page, detail: { type: 'service', id: b.dataset.id } })
      } else if (a === 'service-toggle') {
        store.setServiceStatus(b.dataset.id, b.dataset.to, { actor: state.profile.name })
        state.services = store.listServiceOverrides()
        state.audit = store.listAudit()
        render()
        notify(`Service ${b.dataset.to}.`)
      } else if (a === 'open-audit') {
        go({ env: state.env, page: state.page, detail: { type: 'audit', id: b.dataset.id } })
      } else if (a === 'open-record') {
        go({ env: state.env, page: state.page, detail: { type: 'record', id: b.dataset.id } })
      } else if (a === 'record-save') {
        const titleEl = document.querySelector('#record-title')
        const detailEl = document.querySelector('#record-detail')
        const title = (titleEl?.value || '').trim()
        if (!title) {
          notify('Enter a title first.')
          titleEl?.focus()
          return
        }
        store.updateRecord(b.dataset.collection, b.dataset.id, {
          title,
          detail: (detailEl?.value || '').trim(),
        })
        state.items = store.allRecords()
        state.audit = store.listAudit()
        render()
        notify('Draft saved.')
      } else if (a === 'record-transition') {
        const to = b.dataset.to
        const note = (document.querySelector('#record-note')?.value || '').trim()
        try {
          store.transitionRecord(b.dataset.collection, b.dataset.id, {
            to,
            actor: state.profile.name,
            note,
          })
        } catch (err) {
          notify(err.message || 'That change is not allowed.')
          return
        }
        state.items = store.allRecords()
        state.audit = store.listAudit()
        addNotification(`Record ${STATUS_LABELS[to] || to}`, note || `Status changed to ${STATUS_LABELS[to] || to}.`)
        render()
        notify(`Record marked ${(STATUS_LABELS[to] || to).toLowerCase()}.`)
      } else if (a === 'org-profile-edit') {
        state.modal = 'org-profile'
        render()
      } else if (a === 'org-profile-save') {
        const nameEl = document.querySelector('#org-name')
        const aboutEl = document.querySelector('#org-about')
        const name = (nameEl?.value || '').trim()
        if (!name) {
          notify('Enter an organisation name first.')
          nameEl?.focus()
          return
        }
        state.orgProfile = store.updateOrgProfile({ name, about: (aboutEl?.value || '').trim() })
        state.audit = store.listAudit()
        state.modal = null
        render()
        notify('Organisation profile saved.')
      } else if (a === 'profile') {
        state.modal = 'profile'
        render()
      } else if (a === 'notifications') {
        state.modal = 'notifications'
        render()
      } else if (a === 'theme-settings') {
        notify('Theme settings opened — use the appearance dropdown below.')
      } else if (a === 'toggle-dark') {
        state.dark = !state.dark
        saveState()
        render()
        notify(state.dark ? 'Dark Mode on' : 'Dark Mode off')
      } else if (a === 'preview-org') {
        go({ env: 'org', page: 'Overview' })
        notify('Organisation Admin preview — fixed theme applied.')
      } else if (a === 'close-modal') {
        // Ignore clicks on the dialog body; only the overlay or the ${iconSvg('close', 18)} button closes.
        if (b.classList.contains('modal-overlay') && ev.target.closest('.modal')) return
        closeModal()
      } else if (a === 'save-profile') {
        saveProfile()
      } else if (a === 'mark-all-read') {
        state.notifications = store.markAllRead()
        render()
        notify('All notifications marked as read.')
      } else if (a === 'clear-notifications') {
        state.notifications = store.clearNotifications()
        render()
        notify('Notifications cleared.')
      } else if (a === 'choose-create') {
        state.createType = b.dataset.type || null
        state.modal = state.createType ? 'create-form' : 'create'
        render()
      } else if (a === 'back-to-create') {
        state.createType = null
        state.modal = 'create'
        render()
      } else if (a === 'submit-create') {
        submitCreate()
      } else if (a === 'credits') {
        state.modal = 'credits'
        render()
      } else {
        notify('Prototype placeholder — this action will connect to the IGIFY backend in a later implementation.')
      }
    })
  })

  // Placeholder controls announce their status before they are clicked.
  document.querySelectorAll('[data-action="demo"]').forEach((b) => {
    b.title = 'Prototype placeholder — not connected to a live service'
  })

  // Move focus into an open dialog for keyboard users.
  const modalEl = document.querySelector('.modal')
  if (modalEl) {
    const field = modalEl.querySelector('input, textarea')
    if (field) field.focus()
  }

  const search = document.querySelector('#search')
  search.addEventListener('input', (ev) => {
    state.search = ev.target.value
  })
  search.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter') return
    const value = ev.target.value.trim()
    if (!value) return
    go({ env: state.env, page: 'Search', search: value })
  })

  // Appearance page theme control (Administrator → Appearance & Interface)
  const themeChoice = document.querySelector('#theme-choice')
  if (themeChoice) {
    themeChoice.addEventListener('change', (ev) => {
      state.theme = ev.target.value
      state.dark = false
      saveState()
      render()
      notify(`Theme: ${themeNames[state.theme]}`)
    })
  }

  // Theme dropdown in sidebar. The Organisation Admin workspace uses its own
  // fixed theme, so a user-facing theme choice would be misleading there.
  if (state.env !== 'org') {
    const themeSelect = document.createElement('select')
    themeSelect.innerHTML = themeOptions
    themeSelect.value = state.theme
    themeSelect.style.cssText =
      'width:100%;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 12px;margin-top:10px;font-size:13px;'
    themeSelect.addEventListener('change', (ev) => {
      state.theme = ev.target.value
      state.dark = false
      saveState()
      render()
    })
    const sidebarBottom = document.querySelector('.sidebar-bottom')
    if (sidebarBottom) {
      sidebarBottom.parentNode.insertBefore(themeSelect, sidebarBottom)
    }
  }
}

render()

// ── Keyboard shortcuts (accessibility) ────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (state.env === 'org' && e.altKey && ['t', 'd'].includes(e.key.toLowerCase())) {
    e.preventDefault()
    notify('Organisation Admin uses its own fixed theme.')
    return
  }
  if (e.altKey && e.key.toLowerCase() === 't') {
    e.preventDefault()
    const keys = Object.keys(themeNames)
    const idx = keys.indexOf(state.theme)
    state.theme = keys[(idx + 1) % keys.length]
    state.dark = false
    saveState()
    render()
    notify(`Theme: ${themeNames[state.theme]}`)
  }
  if (e.altKey && e.key.toLowerCase() === 'd') {
    e.preventDefault()
    state.dark = !state.dark
    saveState()
    render()
    notify(state.dark ? 'Dark Mode on' : 'Dark Mode off')
  }
  if (e.key === 'Escape') {
    if (state.modal) {
      closeModal()
      return
    }
    if (state.detail) {
      go({ env: state.env, page: state.page, detail: null })
      return
    }
    state.sidebar = false
    saveState()
    render()
  }
})

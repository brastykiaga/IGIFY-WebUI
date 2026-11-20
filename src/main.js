import './style.css'

const environments = {
  public: { label: 'Public', title: 'Discover IGIFY', subtitle: 'Discover. Learn. Connect.', nav: ['Home','Discover','Learn','Community & Events','Latest News','Listen & Watch','About IGIFY'] },
  member: { label: 'Member', title: 'My Space', subtitle: 'Your community, learning and saved resources.', nav: ['Home','My Profile','Continue Learning','Saved Resources','Messages','My Groups','Community & Events'] },
  org: { label: 'Organisation Admin', title: 'Organisation workspace', subtitle: 'Manage your organisation’s presence and activities.', nav: ['Overview','Organisation Profile','Members','Content','Events','Resources','Reports'] },
  admin: { label: 'IGIFY Administrator', title: 'Administrator Dashboard', subtitle: 'Platform oversight, governance and operations.', nav: ['Dashboard','Users & Identity','Organisations','Content & Editorial','Community & Safety','Modules & Services','Appearance & Interface','Platform & System','Audit & Activity'] }
}

const state = { env:'public', page:'Home', theme:'classic', dark:false, sidebar:true, search:'', toast:'' }
const themeNames = {
  deep:'Deep Charcoal', classic:'Classic Charcoal', soft:'Soft Charcoal',
  executive:'Executive Charcoal', mist:'Mist Charcoal'
}

const icon = (name) => ({
  Home:'⌂', Discover:'⌕', Learn:'▤', 'Community & Events':'♧', 'Latest News':'▣',
  'Listen & Watch':'♫', 'About IGIFY':'ⓘ', 'My Profile':'◉',
  'Continue Learning':'▷', 'Saved Resources':'☆', Messages:'✉', 'My Groups':'♧',
  Overview:'▦', 'Organisation Profile':'▤', Members:'♙', Content:'▧', Events:'▣',
  Resources:'▤', Reports:'▥', Dashboard:'▦', 'Users & Identity':'♙',
  Organisations:'▧', 'Content & Editorial':'▤', 'Community & Safety':'♧',
  'Modules & Services':'▦', 'Appearance & Interface':'◐', 'Platform & System':'⚙',
  'Audit & Activity':'≡'
}[name] || '•')

function notify(message) {
  state.toast = message
  render()
  setTimeout(() => { state.toast=''; render() }, 2300)
}
function card(title, desc, meta='Explore') {
  return `<article class="content-card"><div class="card-mark">${title.slice(0,1)}</div><div><h3>${title}</h3><p>${desc}</p><button class="text-action" data-action="demo">${meta} →</button></div></article>`
}

// ── Public WebUI content ──────────────────────────────────────────────

function publicHome() {
  return `<section class="hero"><div class="eyebrow">WELCOME TO IGIFY</div><h2>Discover. Learn. Connect.</h2><p>A local community space for knowledge, useful services, learning and connection.</p><button class="primary" data-action="discover">Explore IGIFY</button></section><section class="section"><div class="section-title"><h2>Featured</h2><span class="muted">Selected IGIFY highlights</span></div><div class="feature-grid">${card('Featured story','A lead story selected for the community.')}${card('Learning spotlight','Discover practical knowledge and learning resources.')}${card('Community highlight','A local initiative or event worth knowing about.')}</div></section><section class="section"><div class="section-title"><h2>Latest News & Announcements</h2><a data-action="demo">See all →</a></div><div class="feature-grid">${card('Community update','Important local news and announcements.')}${card('Learning & opportunity','New resources and opportunities to explore.')}</div></section><section class="section"><div class="section-title"><h2>Explore IGIFY</h2></div><div class="feature-grid">${card('Learn','Educational resources and practical skills.')}${card('Discover','Explore information, ideas and knowledge.')}${card('Skills & Farming','Useful local skills and agricultural knowledge.')}${card('Faith & Family','Resources for faith, family and community life.')}${card('Listen & Watch','Radio, television and recorded media.')}${card('Community & Events','Find local activities and community happenings.')}</div></section><section class="section"><div class="section-title"><h2>What's everyone talking about?</h2></div><div class="feature-grid">${card('Community trending','Topics attracting attention in the local community.')}${card('World trending','Selected wider-world topics, clearly distinguished.')}</div></section>`
}

function publicDiscover() {
  return `<section class="section"><div class="section-title"><h2>Discover</h2><p>Explore the breadth of locally available knowledge, resources and services.</p></div></section><section class="panel"><h2>Curated discovery categories</h2><div class="feature-grid">${card('Learn','Educational resources and practical skills.')}${card('Discover','Explore information, ideas and knowledge.')}${card('Skills & Farming','Useful local skills and agricultural knowledge.')}${card('Faith & Family','Resources for faith, family and community life.')}</div></section><section class="panel"><h2>Local knowledge and information</h2><div class="feature-grid">${card('History & Archives','Offline copies of local government and community records.')}${card('Learning opportunities','Courses, workshops and study programs nearby.')}${card('Services','Local services and community support.')}</div></section><section class="panel"><h2>Media</h2><div class="feature-grid">${card('Listen & Watch','Radio stations, television channels and recorded media.')}${card('Search IGIFY','Search across local content and services.')}</div></section>`
}

function publicLearn() {
  return `<section class="section"><div class="section-title"><h2>Learn</h2><p>Educational and practical learning material for all ages.</p></div></section><section class="panel"><h2>School and study</h2><div class="feature-grid">${card('Study resources','Materials for school and continuing education.')}${card('Exam preparation','Practice and revision support.')}</div></section><section class="panel"><h2>Practical skills</h2><div class="feature-grid">${card('Digital skills','Computer basics, internet safety and productivity.')}${card('Skills & Farming','Agricultural knowledge and local trades.')}</div></section><section class="panel"><h2>Reading and books</h2><div class="feature-grid">${card('Digital library','Books, articles and documents to read online or offline.')}${card('Faith & Family learning','Resources for faith, family and community life.')}</div></section>`
}

function publicCommunityEvents() {
  return `<section class="section"><div class="section-title"><h2>Community & Events</h2><p>Local community activity and public information.</p></div></section><section class="panel"><h2>Community noticeboard</h2><div class="feature-grid">${card('Community announcements','Local notices and public information.')}${card('Local initiatives','Community-led projects and activities.')}</div></section><section class="panel"><h2>Events</h2><div class="feature-grid">${card('Upcoming events','Local activities and gatherings.')}${card('Learning events','Workshops, classes and study groups.')}${card('Faith & Family events','Faith and family community gatherings.')}</div></section><section class="panel"><h2>Organisations and groups</h2><div class="feature-grid">${card('Organisation updates','News from approved local organisations.')}${card('Public group information','Groups open to community members.')}</div></section>`
}

function publicLatestNews() {
  return `<section class="section"><div class="section-title"><h2>Latest News</h2><p>Local and provincial news and announcements.</p></div></section><section class="panel"><h2>Local and provincial news</h2><div class="feature-grid">${card('Community update','Important local news and announcements.')}${card('Education & opportunity','New resources and learning opportunities.')}</div></section><section class="panel"><h2>Local services and IGIFY announcements</h2><div class="feature-grid">${card('Local services','Community services and support.')}${card('IGIFY announcements','Official platform notices.')}${card('Organisation notices','Updates from approved organisations.')}</div></section><section class="panel"><div class="panel-head"><h2>Offline notice</h2><p class="muted">This deployment displays content acquired and stored locally. It does not imply that unavailable live internet feeds are current.</p></div></section>`
}

function publicListenWatch() {
  return `<section class="section"><div class="section-title"><h2>Listen & Watch</h2><p>Unified media discovery destination.</p></div></section><section class="panel"><h2>Listen</h2><div class="feature-grid">${card('Radio stations','Local and community radio.')}${card('Music discovery','Music collections and discovery.')}${card('Recorded audio','Audio programmes and podcasts.')}</div></section><section class="panel"><h2>Watch</h2><div class="feature-grid">${card('Television channels','Local and community TV.')}${card('Video library','Recorded video content.')}${card('Educational video','Learning and instructional video.')}</div></section><section class="panel"><div class="panel-head"><h2>Playback notice</h2><p class="muted">Actual playback depends on the corresponding local service and its availability.</p></div></section>`
}

function publicAbout() {
  return `<section class="section"><div class="section-title"><h2>About IGIFY</h2><p>What IGIFY is and how it serves your community.</p></div></section><section class="panel"><h2>Our purpose</h2><p>IGIFY is a local community platform for knowledge, community connection and local digital services.</p></section><section class="panel"><h2>Access</h2><div class="feature-grid">${card('Public browsing','Open to all visitors without an account.')}${card('Registered features','Some interactive features require registration and approval.')}${card('Local &amp; offline','Content remains available when the internet is unavailable.')}</div></section>`
}

// ── Member WebUI content ──────────────────────────────────────────────

function memberHome() {
  return `<section class="welcome"><span class="eyebrow">WELCOME BACK</span><h2>Your IGIFY space</h2><p>Pick up where you left off, keep track of your learning and stay connected with your community.</p></section><section class="section"><div class="section-title"><h2>Continue where you left off</h2><a data-action="demo">View history →</a></div><div class="feature-grid">${card('Your learning','Return to your last lesson or saved learning resource.')}${card('Saved resources','Books, articles and useful material saved for later.')}${card('Community activity','Updates from your groups and organisation.')}</div></section><section class="panel"><h2>Messages & activity</h2><p class="muted">Your unread messages, group updates and personal notices will appear here.</p></section>`
}

function memberProfile() {
  return `<section class="section"><div class="section-title"><h2>My Profile</h2><p>View and manage your permitted profile information.</p></div></section><section class="panel"><div class="panel-head"><h2>Profile information</h2><button class="primary" data-action="demo">Edit profile</button></div><div class="feature-grid">${card('Account status','Your current account and verification state.')}${card('Personal details','View and update permitted profile information.')}${card('Privacy','Your private identity and verification information is not exposed publicly.')}</div></section>`
}

function memberContinueLearning() {
  return `<section class="section"><div class="section-title"><h2>Continue Learning</h2><p>Resume your last lesson or learning resource.</p></div></section><section class="panel"><div class="panel-head"><h2>Your learning</h2><a data-action="demo">View all →</a></div><div class="feature-grid">${card('Last lesson','Return to where you left off.')}${card('Recent activity','Your recent learning history.')}${card('Progress','Track your learning progress when supported.')}</div></section>`
}

function memberSavedResources() {
  return `<section class="section"><div class="section-title"><h2>Saved Resources</h2><p>Saved books, articles, documents and lessons.</p></div></section><section class="panel"><div class="panel-head"><h2>Your saved items</h2><a data-action="demo">View all →</a></div><div class="feature-grid">${card('Saved books','Books saved for later reading.')}${card('Saved articles','Articles and documents.')}${card('Saved lessons','Learning resources.')}</div></section>`
}

function memberMessages() {
  return `<section class="section"><div class="section-title"><h2>Messages</h2><p>Member messages and unread indicators.</p></div></section><section class="panel"><div class="panel-head"><h2>Inbox</h2><a data-action="demo">View all →</a></div><div class="feature-grid">${card('Unread messages','Messages you have not yet read.')}${card('Conversations','Your message threads.')}${card('Group updates','Updates from your groups.')}</div></section><div class="panel"><div class="panel-head"><h2>Notice</h2><p class="muted">Messaging is only functional when the approved messaging service is connected.</p></div></section>`
}

function memberMyGroups() {
  return `<section class="section"><div class="section-title"><h2>My Groups</h2><p>Groups you are permitted to view or participate in.</p></div></section><section class="panel"><div class="panel-head"><h2>Your groups</h2><a data-action="demo">View all →</a></div><div class="feature-grid">${card('Group activity','Updates from your groups.')}${card('Membership','Your group memberships.')}${card('Participation','Post and engage within group rules.')}</div></section><div class="panel"><div class="panel-head"><h2>Notice</h2><p class="muted">Membership and posting actions obey moderation, verification and group rules.</p></div></section>`
}

function memberCommunityEvents() {
  return `<section class="section"><div class="section-title"><h2>Community & Events</h2><p>Community and event information for members.</p></div></section><section class="panel"><h2>Community activity</h2><div class="feature-grid">${card('Community noticeboard','Local notices and announcements.')}${card('Local initiatives','Community-led projects.')}${card('Upcoming events','Local activities and gatherings.')}</div></section><section class="panel"><h2>Organisations and groups</h2><div class="feature-grid">${card('Organisation updates','News from approved organisations.')}${card('Public group information','Groups open to community members.')}</div></section>`
}

// ── Organisation Admin content ────────────────────────────────────────

function orgOverview() {
  return `<div class="stats"><div class="stat"><span>Members</span><b>126</b><small>Sample organisation</small></div><div class="stat"><span>Published items</span><b>18</b><small>Illustrative sample</small></div><div class="stat"><span>Upcoming events</span><b>4</b><small>Illustrative sample</small></div></div><section class="panel"><div class="panel-head"><h2>Overview</h2><button class="primary" data-action="create">＋ Create</button></div><div class="feature-grid">${card('Pending tasks','Your organisation’s pending tasks.')}${card('Recent activity','Recent content and event activity.')}${card('Membership summary','Membership and activity summaries.')}</div></section>`
}

function orgProfile() {
  return `<section class="section"><div class="section-title"><h2>Organisation Profile</h2><p>Maintain your organisation’s public information.</p></div></section><section class="panel"><div class="panel-head"><h2>Organisation details</h2><button class="primary" data-action="demo">Edit profile</button></div><div class="feature-grid">${card('Public information','Maintain approved public organisation information.')}${card('Review','Changes may require review depending on the field and policy.')}</div></section>`
}

function orgMembers() {
  return `<section class="section"><div class="section-title"><h2>Members</h2><p>View organisation membership within granted permissions.</p></div></section><section class="panel"><div class="panel-head"><h2>Membership</h2><button class="primary" data-action="demo">Manage roles</button></div><div class="feature-grid">${card('Members','View organisation membership.')}${card('Roles','Manage permitted organisation roles or requests.')}${card('Rules','Do not bypass IGIFY identity and approval rules.')}</div></section>`
}

function orgContent() {
  return `<section class="section"><div class="section-title"><h2>Content</h2><p>Prepare and submit organisation content.</p></div></section><section class="panel"><div class="panel-head"><h2>Submissions</h2><button class="primary" data-action="create">＋ Create</button></div><div class="feature-grid">${card('Prepare content','Prepare organisation content for submission.')}${card('Publishing','Publishing approval remains with the authorised editorial process.')}</div></section>`
}

function orgEvents() {
  return `<section class="section"><div class="section-title"><h2>Events</h2><p>Prepare and manage organisation event information.</p></div></section><section class="panel"><div class="panel-head"><h2>Events</h2><button class="primary" data-action="create">＋ Create</button></div><div class="feature-grid">${card('Manage events','Prepare and manage organisation event information.')}${card('Visibility','Public visibility follows publishing and moderation rules.')}</div></section>`
}

function orgResources() {
  return `<section class="section"><div class="section-title"><h2>Resources</h2><p>Manage or submit organisation resources within assigned permissions.</p></div></section><section class="panel"><div class="panel-head"><h2>Resources</h2><button class="primary" data-action="create">＋ Create</button></div><div class="feature-grid">${card('Manage resources','Manage organisation resources.')}${card('Permissions','Within your assigned permissions.')}</div></section>`
}

function orgReports() {
  return `<section class="section"><div class="section-title"><h2>Reports</h2><p>View available organisation activity and engagement summaries.</p></div></section><section class="panel"><div class="panel-head"><h2>Activity summaries</h2><button class="primary" data-action="demo">View reports</button></div><div class="feature-grid">${card('Engagement','View organisation engagement summaries.')}${card('Activity','View organisation activity reports.')}</div></section>`
}

// ── IGIFY Administrator content ───────────────────────────────────────

function adminDashboard() {
  return `<div class="stats"><div class="stat"><span>Pending reviews</span><b>12</b><small>Illustrative sample</small></div><div class="stat"><span>Registered members</span><b>1,284</b><small>Illustrative sample</small></div><div class="stat"><span>Organisations</span><b>38</b><small>Illustrative sample</small></div><div class="stat"><span>Services</span><b>14 / 16</b><small>Illustrative sample</small></div></div><section class="panel"><div class="panel-head"><h2>Pending attention</h2><button class="outline" data-action="demo">View queue</button></div><div class="row-item"><span>Identity reviews awaiting decision</span><b>7</b></div><div class="row-item"><span>Organisation requests</span><b>3</b></div><div class="row-item"><span>Content awaiting approval</span><b>2</b></div></section><section class="panel"><h2>Administrative announcements</h2><p class="muted">Important platform notices and operational updates will appear here.</p></section>`
}

function adminUsersIdentity() {
  return `<section class="panel"><div class="panel-head"><h2>Users & Identity</h2><button class="primary" data-action="demo">Manage users</button></div><div class="feature-grid">${card('User directory','User directory and profile management.')}${card('Registration review','Registration and account review.')}${card('KYC verification','KYC verification and approval.')}${card('Member status','Member status and restrictions.')}${card('User activity','User activity and history.')}</div></section>`
}

function adminOrganisations() {
  return `<section class="panel"><div class="panel-head"><h2>Organisations</h2><button class="primary" data-action="demo">Manage organisations</button></div><div class="feature-grid">${card('Organisation registration','Organisation registration and approval.')}${card('Organisation profiles','Organisation profiles and records.')}${card('Membership oversight','Membership oversight.')}${card('Admin appointments','Organisation Admin appointments and approvals.')}${card('Organisation status','Organisation status and review.')}</div></section>`
}

function adminContentEditorial() {
  return `<section class="panel"><div class="panel-head"><h2>Content & Editorial</h2><button class="primary" data-action="demo">Manage content</button></div><div class="feature-grid">${card('Publishing','Content publishing and approval.')}${card('Homepage placement','Homepage featured and editorial placement.')}${card('News','News and announcements.')}${card('Noticeboard','Noticeboard and community events.')}${card('Categories','Categories, tags and expiry.')}</div></section>`
}

function adminCommunitySafety() {
  return `<section class="panel"><div class="panel-head"><h2>Community & Safety</h2><button class="primary" data-action="demo">Manage safety</button></div><div class="feature-grid">${card('Groups','Groups and membership oversight.')}${card('Moderation','Discussion and comment moderation.')}${card('Reports','Reports, complaints and flagged content.')}${card('Notices','Community notices and announcements.')}${card('Safety','Safety controls.')}</div></section>`
}

function adminModulesServices() {
  return `<section class="panel"><div class="panel-head"><h2>Modules & Services</h2><button class="primary" data-action="demo">Manage services</button></div><div class="feature-grid">${card('Modules','Manage IGIFY modules and services.')}${card('Radio & TV','Radio and TV management.')}${card('Learning','Learning resources.')}${card('Search','Migle search and content availability.')}${card('Health','Service health and availability indicators.')}</div></section>`
}

function adminAppearanceInterface() {
  return `<section class="panel"><div class="panel-head"><h2>Appearance & Interface</h2><button class="primary" data-action="demo">Configure appearance</button></div><div class="feature-grid">${card('Themes','Light theme allocation.')}${card('Org theme','Organisation Admin dashboard theme.')}${card('Dark Mode','Dark Mode policy and preferences.')}${card('Homepage','Homepage appearance and layout.')}${card('Navigation','Navigation and interface settings.')}</div></section>`
}

function adminPlatformSystem() {
  return `<section class="panel"><div class="panel-head"><h2>Platform & System</h2><button class="primary" data-action="demo">Configure platform</button></div><div class="feature-grid">${card('Configuration','General platform configuration.')}${card('Provincial','Local provincial settings.')}${card('Notifications','Notifications and communications.')}${card('AI','AI / Ask AI configuration.')}${card('Offline','Offline content and synchronisation.')}${card('Security','Security and access monitoring.')}${card('Health','System health and service status.')}${card('Backup','Backup and recovery.')}</div></section>`
}

function adminAuditActivity() {
  return `<section class="panel"><div class="panel-head"><h2>Audit & Activity</h2><button class="primary" data-action="demo">View audit log</button></div><div class="feature-grid">${card('Audit register','Audit event register.')}${card('Events','Actor, timestamp, action, category and outcome.')}${card('Approvals','Approval and publishing events.')}${card('Security','Security and administrative events.')}${card('Export','Exportable audit records where authorised.')}</div></section>`
}

function contentFor(env, page) {
  if (env === 'admin') {
    const adminPages = {
      Dashboard: adminDashboard,
      'Users & Identity': adminUsersIdentity,
      Organisations: adminOrganisations,
      'Content & Editorial': adminContentEditorial,
      'Community & Safety': adminCommunitySafety,
      'Modules & Services': adminModulesServices,
      'Appearance & Interface': adminAppearanceInterface,
      'Platform & System': adminPlatformSystem,
      'Audit & Activity': adminAuditActivity
    }
    const fn = adminPages[page]
    if (fn) return fn()
    return `<section class="panel"><div class="panel-head"><h2>${page}</h2><p class="muted">Administrative workspace · demonstration content</p></div></section>`
  }
  if (env === 'org') {
    const orgPages = {
      Overview: orgOverview,
      'Organisation Profile': orgProfile,
      Members: orgMembers,
      Content: orgContent,
      Events: orgEvents,
      Resources: orgResources,
      Reports: orgReports
    }
    const fn = orgPages[page]
    if (fn) return fn()
    return `<section class="panel"><div class="panel-head"><h2>${page}</h2><button class="primary" data-action="create">＋ Create</button></div><div class="feature-grid">${card('Organisation profile','Maintain your organisation information and public presence.')}${card('Members & roles','Review organisation membership and assigned responsibilities.')}${card('Content & events','Prepare submissions for the IGIFY publishing process.')}${card('Reports','View illustrative engagement and activity summaries.')}</div></section>`
  }
  if (env === 'member') {
    const memberPages = {
      Home: memberHome,
      'My Profile': memberProfile,
      'Continue Learning': memberContinueLearning,
      'Saved Resources': memberSavedResources,
      Messages: memberMessages,
      'My Groups': memberMyGroups,
      'Community & Events': memberCommunityEvents
    }
    const fn = memberPages[page]
    if (fn) return fn()
    return `<section class="panel"><h2>${page}</h2><p class="muted">Member workspace · demonstration content</p></section>`
  }
  // public
  const publicPages = {
    Home: publicHome,
    Discover: publicDiscover,
    Learn: publicLearn,
    'Community & Events': publicCommunityEvents,
    'Latest News': publicLatestNews,
    'Listen & Watch': publicListenWatch,
    'About IGIFY': publicAbout
  }
  const fn = publicPages[page]
  if (fn) return fn()
  return `<section class="panel"><h2>${page}</h2><p class="muted">Public workspace · demonstration content</p></section>`
}

function render() {
  const e = environments[state.env]
  document.documentElement.dataset.theme = state.dark ? 'dark' : state.theme
  const nav = e.nav.map(n => `<button class="nav-link ${state.page === n ? 'active' : ''}" data-page="${n}"><span>${icon(n)}</span><label>${n}</label></button>`).join('')
  document.querySelector('#app').innerHTML = `
  <div class="app-shell ${state.sidebar ? '' : 'sidebar-hidden'}">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">i</div><div><strong>IGIFY</strong><small>Discover. Learn. Connect.</small></div></div>
      <div class="env-label">WORKSPACE</div>
      <select id="environment" aria-label="Choose environment">
        <option value="public" ${state.env === 'public' ? 'selected' : ''}>Public WebUI</option>
        <option value="member" ${state.env === 'member' ? 'selected' : ''}>Registered Member</option>
        <option value="org" ${state.env === 'org' ? 'selected' : ''}>Organisation Admin</option>
        <option value="admin" ${state.env === 'admin' ? 'selected' : ''}>IGIFY Administrator</option>
      </select>
      <nav>${nav}</nav>
      <div class="sidebar-bottom"><span class="status-dot"></span> Prototype environment <small>v1.0 · sample data</small></div>
    </aside>
    <main class="main">
      <header class="topbar"><button class="icon-btn menu-btn" data-action="sidebar" aria-label="Toggle sidebar">☰</button><div class="breadcrumb">${e.label} <span>/</span> ${state.page}</div><div class="top-actions"><div class="search"><span>⌕</span><input id="search" placeholder="Search IGIFY" value="${state.search.replaceAll('"', '&quot;')}"></div><button class="icon-btn" data-action="notifications" title="Notifications">♧</button><button class="profile" data-action="profile">U</button></div></header>
      <div class="page-wrap"><div class="page-heading"><div><div class="eyebrow">${e.label.toUpperCase()}</div><h1>${state.page === 'Home' ? e.title : state.page}</h1><p>${e.subtitle}</p></div>${state.env === 'admin' ? '<button class="primary create-top" data-action="create">＋ Create</button>' : ''}</div>
      ${contentFor(state.env, state.page)}
      <footer>IGIFY WebUI Prototype v1.0 <span>Frontend demonstration · Not connected to production services</span></footer></div>
    </main>
    <div class="toast ${state.toast ? 'show' : ''}">${state.toast}</div>
  </div>`
  document.querySelector('#environment').addEventListener('change', ev => { state.env = ev.target.value; state.page = environments[state.env].nav[0]; render() })
  document.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => { state.page = b.dataset.page; render() }))
  document.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.action
    if (a === 'sidebar') { state.sidebar = !state.sidebar; render() }
    else if (a === 'create') notify('Create shortcut selected — workflow will be connected in a later implementation.')
    else if (a === 'discover') { state.page = 'Discover'; render() }
    else if (a === 'profile') notify('Profile menu demonstration')
    else if (a === 'notifications') notify('No new demonstration notifications')
    else notify('This is a prototype interaction; no live service is connected.')
  }))
  const search = document.querySelector('#search')
  search.addEventListener('input', ev => { state.search = ev.target.value })
  search.addEventListener('keydown', ev => { if (ev.key === 'Enter') notify(state.search ? `Demo search for “${state.search}” — search service not connected.` : 'Enter a search term.') })
}
render()

// Theme controls are available from the footer via the settings shortcut.
document.addEventListener('keydown', e => {
  if (e.altKey && e.key.toLowerCase() === 't') {
    const keys = Object.keys(themeNames), idx = keys.indexOf(state.theme)
    state.theme = keys[(idx + 1) % keys.length]; state.dark = false; render()
    notify(`Theme: ${themeNames[state.theme]}`)
  }
  if (e.altKey && e.key.toLowerCase() === 'd') { state.dark = !state.dark; render(); notify(state.dark ? 'Dark Mode on' : 'Dark Mode off') }
})
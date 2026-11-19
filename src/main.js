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
function adminContent(page) {
  const descriptions = {
    'Users & Identity':['User directory','Registration review','KYC verification','Member status & restrictions','User activity history'],
    'Organisations':['Organisation registration','Organisation profiles','Membership oversight','Organisation Admin appointments','Organisation status & review'],
    'Content & Editorial':['Content publishing & approval','Homepage featured content','News & announcements','Noticeboard & events','Categories, tags & expiry'],
    'Community & Safety':['Community groups','Discussion & comment moderation','Reports & complaints','Community notices','Safety controls'],
    'Modules & Services':['Manage IGIFY modules','Radio & TV services','Learning resources','Migle search','Service availability'],
    'Appearance & Interface':['Light theme allocation','Organisation Admin theme','Dark Mode preferences','Homepage layout','Navigation settings'],
    'Platform & System':['Platform configuration','Provincial settings','Notifications','AI & Ask AI','Offline content & synchronisation','Security monitoring','System health','Backup & recovery'],
    'Audit & Activity':['Audit event register','Approvals and publishing events','Security events','Administrative changes','Export sample records']
  }
  if(page==='Dashboard') return `<div class="stats"><div class="stat"><span>Pending reviews</span><b>12</b><small>Illustrative sample</small></div><div class="stat"><span>Registered members</span><b>1,284</b><small>Illustrative sample</small></div><div class="stat"><span>Organisations</span><b>38</b><small>Illustrative sample</small></div><div class="stat"><span>Services</span><b>14 / 16</b><small>Illustrative sample</small></div></div><section class="panel"><div class="panel-head"><h2>Pending attention</h2><button class="outline" data-action="demo">View queue</button></div><div class="row-item"><span>Identity reviews awaiting decision</span><b>7</b></div><div class="row-item"><span>Organisation requests</span><b>3</b></div><div class="row-item"><span>Content awaiting approval</span><b>2</b></div></section><section class="panel"><h2>Administrative announcements</h2><p class="muted">Important platform notices and operational updates will appear here.</p></section>`
  const list=descriptions[page] || ['Overview','Recent activity','Settings and controls']
  return `<section class="panel"><div class="panel-head"><div><h2>${page}</h2><p class="muted">Administrative workspace · demonstration content</p></div><button class="primary" data-action="create">＋ Create</button></div><div class="feature-grid">${list.map((x,i)=>card(x,`Manage and review ${x.toLowerCase()} within the IGIFY administration environment.`, 'Open section')).join('')}</div></section>`
}
function contentFor(env,page) {
  if(env==='admin') return adminContent(page==='Home'?'Dashboard':page)
  if(env==='org') return `<div class="stats"><div class="stat"><span>Members</span><b>126</b><small>Sample organisation</small></div><div class="stat"><span>Published items</span><b>18</b><small>Illustrative sample</small></div><div class="stat"><span>Upcoming events</span><b>4</b><small>Illustrative sample</small></div></div><section class="panel"><div class="panel-head"><h2>${page}</h2><button class="primary" data-action="create">＋ Create</button></div><div class="feature-grid">${card('Organisation profile','Maintain your organisation information and public presence.')}${card('Members & roles','Review organisation membership and assigned responsibilities.')}${card('Content & events','Prepare submissions for the IGIFY publishing process.')}${card('Reports','View illustrative engagement and activity summaries.')}</div></section>`
  if(env==='member') return `<section class="welcome"><span class="eyebrow">WELCOME BACK</span><h2>Your IGIFY space</h2><p>Pick up where you left off, keep track of your learning and stay connected with your community.</p></section><section class="section"><div class="section-title"><h2>Continue where you left off</h2><a data-action="demo">View history →</a></div><div class="feature-grid">${card('Your learning','Return to your last lesson or saved learning resource.')}${card('Saved resources','Books, articles and useful material saved for later.')}${card('Community activity','Updates from your groups and organisation.')}</div></section><section class="panel"><h2>Messages & activity</h2><p class="muted">Your unread messages, group updates and personal notices will appear here.</p></section>`
  return `<section class="hero"><div class="eyebrow">WELCOME TO IGIFY</div><h2>Discover. Learn. Connect.</h2><p>A local community space for knowledge, useful services, learning and connection.</p><button class="primary" data-action="discover">Explore IGIFY</button></section><section class="section"><div class="section-title"><h2>Featured</h2><span class="muted">Selected IGIFY highlights</span></div><div class="feature-grid">${card('Featured story','A lead story selected for the community.')}${card('Learning spotlight','Discover practical knowledge and learning resources.')}${card('Community highlight','A local initiative or event worth knowing about.')}</div></section><section class="section"><div class="section-title"><h2>Latest News & Announcements</h2><a data-action="demo">See all →</a></div><div class="feature-grid">${card('Community update','Important local news and announcements.')}${card('Learning & opportunity','New resources and opportunities to explore.')}</div></section><section class="section"><div class="section-title"><h2>Explore IGIFY</h2></div><div class="feature-grid">${card('Learn','Educational resources and practical skills.')}${card('Discover','Explore information, ideas and knowledge.')}${card('Skills & Farming','Useful local skills and agricultural knowledge.')}${card('Faith & Family','Resources for faith, family and community life.')}${card('Listen & Watch','Radio, television and recorded media.')}${card('Community & Events','Find local activities and community happenings.')}</div></section><section class="section"><div class="section-title"><h2>What's everyone talking about?</h2></div><div class="feature-grid">${card('Community trending','Topics attracting attention in the local community.')}${card('World trending','Selected wider-world topics, clearly distinguished.')}</div></section>`
}
function render() {
  const e=environments[state.env]
  document.documentElement.dataset.theme=state.dark?'dark':state.theme
  const nav=e.nav.map(n=>`<button class="nav-link ${state.page===n?'active':''}" data-page="${n}"><span>${icon(n)}</span><label>${n}</label></button>`).join('')
  document.querySelector('#app').innerHTML=`
  <div class="app-shell ${state.sidebar?'':'sidebar-hidden'}">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">i</div><div><strong>IGIFY</strong><small>Discover. Learn. Connect.</small></div></div>
      <div class="env-label">WORKSPACE</div>
      <select id="environment" aria-label="Choose environment">
        <option value="public" ${state.env==='public'?'selected':''}>Public WebUI</option>
        <option value="member" ${state.env==='member'?'selected':''}>Registered Member</option>
        <option value="org" ${state.env==='org'?'selected':''}>Organisation Admin</option>
        <option value="admin" ${state.env==='admin'?'selected':''}>IGIFY Administrator</option>
      </select>
      <nav>${nav}</nav>
      <div class="sidebar-bottom"><span class="status-dot"></span> Prototype environment <small>v1.0 · sample data</small></div>
    </aside>
    <main class="main">
      <header class="topbar"><button class="icon-btn menu-btn" data-action="sidebar" aria-label="Toggle sidebar">☰</button><div class="breadcrumb">${e.label} <span>/</span> ${state.page}</div><div class="top-actions"><div class="search"><span>⌕</span><input id="search" placeholder="Search IGIFY" value="${state.search.replaceAll('"','&quot;')}"></div><button class="icon-btn" data-action="notifications" title="Notifications">♧</button><button class="profile" data-action="profile">U</button></div></header>
      <div class="page-wrap"><div class="page-heading"><div><div class="eyebrow">${e.label.toUpperCase()}</div><h1>${state.page==='Home'?e.title:state.page}</h1><p>${e.subtitle}</p></div>${state.env==='admin'?'<button class="primary create-top" data-action="create">＋ Create</button>':''}</div>
      ${contentFor(state.env,state.page)}
      <footer>IGIFY WebUI Prototype v1.0 <span>Frontend demonstration · Not connected to production services</span></footer></div>
    </main>
    <div class="toast ${state.toast?'show':''}">${state.toast}</div>
  </div>`
  document.querySelector('#environment').addEventListener('change',ev=>{state.env=ev.target.value;state.page=environments[state.env].nav[0];render()})
  document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{state.page=b.dataset.page;render()}))
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=> {
    const a=b.dataset.action
    if(a==='sidebar'){state.sidebar=!state.sidebar;render()}
    else if(a==='create') notify('Create shortcut selected — workflow will be connected in a later implementation.')
    else if(a==='discover'){state.page='Discover';render()}
    else if(a==='profile') notify('Profile menu demonstration')
    else if(a==='notifications') notify('No new demonstration notifications')
    else notify('This is a prototype interaction; no live service is connected.')
  }))
  const search=document.querySelector('#search')
  search.addEventListener('input',ev=>{state.search=ev.target.value})
  search.addEventListener('keydown',ev=>{if(ev.key==='Enter')notify(state.search?`Demo search for “${state.search}” — search service not connected.`:'Enter a search term.')})
}
render()

// Theme controls are available from the footer via the settings shortcut.
document.addEventListener('keydown',e=>{
  if(e.altKey && e.key.toLowerCase()==='t'){
    const keys=Object.keys(themeNames), idx=keys.indexOf(state.theme)
    state.theme=keys[(idx+1)%keys.length]; state.dark=false; render()
    notify(`Theme: ${themeNames[state.theme]}`)
  }
  if(e.altKey && e.key.toLowerCase()==='d'){state.dark=!state.dark;render();notify(state.dark?'Dark Mode on':'Dark Mode off')}
})

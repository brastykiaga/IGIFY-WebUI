/**
 * Demonstration content for detail screens.
 *
 * These records exist so a card can open something real. They are illustrative
 * sample content, not IGIFY editorial material, and are marked as such in the
 * interface. When the backend exists these become API responses; the shapes
 * below are deliberately close to the record shape in docs/API-CONTRACT.md.
 */

export const TYPE_LABELS = {
  news: 'News',
  learn: 'Learning',
  books: 'Book',
  events: 'Event',
  groups: 'Group',
  organisations: 'Organisation',
  media: 'Media',
}

const record = (type, data) => ({
  type,
  sample: true,
  ...data,
  meta: data.meta || [],
})

export const CATALOGUE = {
  news: [
    record('news', {
      id: 'kundiawa-market',
      title: 'Kundiawa market upgrade announced',
      summary: 'Stall roofing, water points and solar lighting are planned for the main market.',
      image: '/images/card-news.jpg',
      publishedAt: '2026-11-18',
      source: 'Simbu Provincial Government',
      body: [
        'The provincial works office has outlined an upgrade of the main market in Kundiawa, covering stall roofing, additional water points and solar lighting for the evening trade.',
        'Vendors will be consulted on stall allocation before works begin. Trading is expected to continue during construction, with sections closed in stages.',
        'IGIFY will publish the works schedule here as it is released. This page is demonstration content for the prototype.',
      ],
      meta: [
        { label: 'Published', value: '18 November 2026' },
        { label: 'Source', value: 'Simbu Provincial Government' },
        { label: 'Availability', value: 'Stored locally — readable offline' },
      ],
    }),
    record('news', {
      id: 'highlands-connectivity',
      title: 'Highlands connectivity project reaches new villages',
      summary: 'Additional community wifi points are being commissioned across the district.',
      image: '/images/card-news.jpg',
      publishedAt: '2026-11-12',
      source: 'IGINET Initiative',
      body: [
        'New community wifi points are being commissioned in several villages, extending the free access service that IGIFY operates in Kundiawa town.',
        'Because the link to the wider internet is intermittent, content is curated and stored locally so that reading and learning continue during outages.',
        'This page is demonstration content for the prototype.',
      ],
      meta: [
        { label: 'Published', value: '12 November 2026' },
        { label: 'Source', value: 'IGINET Initiative' },
      ],
    }),
  ],

  learn: [
    record('learn', {
      id: 'coffee-farming',
      title: 'Highland coffee: from garden to market',
      summary: 'A practical short course on growing, picking and selling coffee in the highlands.',
      image: '/images/card-farming.jpg',
      publishedAt: '2026-10-30',
      source: 'IGIFY Learning',
      body: [
        'Six short lessons cover site preparation, shade management, picking at the right ripeness, and simple drying and storage that protects quality before sale.',
        'Each lesson is written for smallholder gardens and assumes no special equipment. Lessons are stored locally and can be read without an internet connection.',
        'This page is demonstration content for the prototype; lesson pages are not yet built.',
      ],
      meta: [
        { label: 'Lessons', value: '6' },
        { label: 'Level', value: 'Practical, no prerequisites' },
        { label: 'Availability', value: 'Offline' },
      ],
    }),
    record('learn', {
      id: 'digital-basics',
      title: 'Digital basics for first-time users',
      summary: 'Phones, accounts, safety and finding information you can trust.',
      image: '/images/card-learn.jpg',
      publishedAt: '2026-10-21',
      source: 'IGIFY Learning',
      body: [
        'An introduction to using a smartphone, keeping an account safe, recognising misleading information, and finding locally stored content when the internet is unavailable.',
        'The course is designed for people who have not used a computer or smartphone before, and can be delivered in a community session with a facilitator.',
        'This page is demonstration content for the prototype.',
      ],
      meta: [
        { label: 'Lessons', value: '4' },
        { label: 'Audience', value: 'First-time users' },
      ],
    }),
  ],

  books: [
    record('books', {
      id: 'highlands-stories',
      title: 'Stories from the Highlands',
      summary: 'Collected oral histories from Simbu communities, recorded and transcribed locally.',
      image: '/images/card-learn.jpg',
      publishedAt: '2026-07-14',
      source: 'IGIFY Library',
      body: [
        'A collection of oral histories gathered in Simbu Province, covering settlement, gardening, trade and community life across several generations.',
        'The book is stored locally and can be read without an internet connection. A reading view is not yet implemented in this prototype.',
      ],
      meta: [
        { label: 'Pages', value: 'Sample: 128' },
        { label: 'Format', value: 'PDF, EPUB' },
        { label: 'Availability', value: 'Offline copy' },
      ],
    }),
    record('books', {
      id: 'garden-handbook',
      title: 'The Highland Garden Handbook',
      summary: 'Practical notes on soil, compost, seed saving and household food gardens.',
      image: '/images/card-farming.jpg',
      publishedAt: '2026-06-02',
      source: 'IGIFY Library',
      body: [
        'A short practical handbook for household gardens in the highlands, covering soil preparation, composting, seed saving and seasonal planting.',
        'Written for readers with no formal training and illustrated with simple diagrams. Stored locally for offline reading.',
      ],
      meta: [
        { label: 'Pages', value: 'Sample: 64' },
        { label: 'Format', value: 'PDF' },
        { label: 'Availability', value: 'Offline copy' },
      ],
    }),
  ],

  events: [
    record('events', {
      id: 'provincial-agricultural-show',
      title: 'Simbu Provincial Agricultural Show',
      summary: 'Produce displays, livestock, and demonstrations from local growers.',
      image: '/images/card-farming.jpg',
      publishedAt: '2026-11-05',
      source: 'Provincial Events',
      body: [
        'Growers from across the district will display produce and livestock, with demonstrations on soil care and small-scale irrigation.',
        'Entry is free for community members. Stall applications are handled by the provincial events office.',
        'This page is demonstration content; dates and venue are placeholders.',
      ],
      meta: [
        { label: 'When', value: 'Sample: 12–14 December 2026' },
        { label: 'Where', value: 'Sample: Kundiawa showground' },
        { label: 'Entry', value: 'Free' },
      ],
    }),
  ],

  groups: [
    record('groups', {
      id: 'women-in-business',
      title: 'Kundiawa Women in Business',
      summary: 'A public group for market vendors and small business owners.',
      image: '/images/card-community.jpg',
      publishedAt: '2026-09-14',
      source: 'Public group',
      body: [
        'A community group where vendors share prices, transport arrangements and savings tips. Open to read; posting requires a registered account and group membership.',
        'Group activity is moderated under the community rules described in the design baseline.',
        'This page is demonstration content for the prototype.',
      ],
      meta: [
        { label: 'Members', value: 'Sample: 84' },
        { label: 'Access', value: 'Public to read' },
      ],
    }),
  ],

  organisations: [
    record('organisations', {
      id: 'kundiawa-health-centre',
      title: 'Kundiawa Community Health Centre',
      summary: 'Public health information, clinic hours and community notices.',
      image: '/images/card-faith.jpg',
      publishedAt: '2026-08-02',
      source: 'Approved organisation',
      body: [
        'An approved organisation publishing clinic hours, outreach visits and public health notices for the district.',
        'Organisation content is submitted for editorial approval before it appears publicly. This profile is demonstration content.',
      ],
      meta: [
        { label: 'Status', value: 'Approved (sample)' },
        { label: 'Contact', value: 'Sample details withheld' },
      ],
    }),
  ],

  media: [
    record('media', {
      id: 'radio-simbu',
      title: 'Radio Simbu — 101.5 FM',
      summary: 'Local news, music and community announcements.',
      image: '/images/card-media.jpg',
      publishedAt: '2026-11-20',
      source: 'Community radio',
      body: [
        'A community radio service carrying local news, music and public announcements. Playback depends on the radio service being available on the local network.',
        'This page is demonstration content; the player is not connected to a broadcast service.',
      ],
      meta: [
        { label: 'Frequency', value: 'Sample: 101.5 FM' },
        { label: 'Availability', value: 'Local network only' },
      ],
    }),
  ],
}

export function findRecord(type, id) {
  const list = CATALOGUE[type]
  if (!Array.isArray(list)) return null
  return list.find((item) => item.id === id) || null
}

/**
 * Where a card leads. Category cards open a workspace page; content cards open
 * a detail record. Titles absent from this map keep the placeholder behaviour.
 */
export const CARD_LINKS = {
  // Category cards → workspace pages
  Learn: { page: 'Learn' },
  Discover: { page: 'Discover' },
  'Community & Events': { page: 'Community & Events' },
  'Listen & Watch': { page: 'Listen & Watch' },
  'Skills & Farming': { page: 'Learn' },
  'Faith & Family': { page: 'Learn' },

  // Content cards → detail records
  'Featured story': { type: 'news', id: 'kundiawa-market' },
  'Community update': { type: 'news', id: 'kundiawa-market' },
  'Education and opportunity': { type: 'news', id: 'highlands-connectivity' },
  'Learning spotlight': { type: 'learn', id: 'coffee-farming' },
  'Learning opportunities': { type: 'learn', id: 'digital-basics' },
  'Digital skills': { type: 'learn', id: 'digital-basics' },
  'Digital library': { type: 'books', id: 'highlands-stories' },
  'Saved books': { type: 'books', id: 'highlands-stories' },
  'Saved lessons': { type: 'learn', id: 'coffee-farming' },
  'Upcoming events': { type: 'events', id: 'provincial-agricultural-show' },
  'Public group information': { type: 'groups', id: 'women-in-business' },
  'Organisation updates': { type: 'organisations', id: 'kundiawa-health-centre' },
  'Radio stations': { type: 'media', id: 'radio-simbu' },
  'Television channels': { type: 'media', id: 'radio-simbu' },
  'Community noticeboard': { type: 'groups', id: 'women-in-business' },
}

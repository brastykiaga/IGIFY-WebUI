/**
 * Service catalogue.
 *
 * The module list from the design baseline, with a demonstration status and
 * health for each. Real health would come from the Service Integration Layer;
 * here it is illustrative and the interface says so.
 */

export const HEALTH_LABELS = {
  ok: 'Operational',
  degraded: 'Degraded',
  offline: 'Unavailable',
}

export const SERVICE_STATUS_LABELS = {
  enabled: 'Enabled',
  disabled: 'Disabled',
}

export const SERVICES = [
  {
    id: 'musicbrainz',
    name: 'MusicBrainz',
    category: 'Music',
    description: 'Music search and release metadata for the music module.',
    status: 'enabled',
    health: 'ok',
  },
  {
    id: 'azuracast',
    name: 'AzuraCast',
    category: 'Radio',
    description: 'Radio station hosting and streaming for local stations.',
    status: 'enabled',
    health: 'ok',
  },
  {
    id: 'tv-streaming',
    name: 'TV Streaming App',
    category: 'Television',
    description: 'Television channel listings and streaming entry point.',
    status: 'enabled',
    health: 'degraded',
  },
  {
    id: 'freshrss',
    name: 'FreshRSS',
    category: 'News',
    description: 'Curated news feeds, stored locally for offline reading.',
    status: 'enabled',
    health: 'ok',
  },
  {
    id: 'wallabag',
    name: 'Wallabag',
    category: 'Reading',
    description: 'Read-it-later document store for saved articles.',
    status: 'enabled',
    health: 'ok',
  },
  {
    id: 'stepbible',
    name: 'StepBible',
    category: 'Faith',
    description: 'Bible study texts and reference material.',
    status: 'enabled',
    health: 'ok',
  },
  {
    id: 'today-in-history',
    name: 'Today-In-History',
    category: 'Reference',
    description: 'Daily historical notes for the Discover module.',
    status: 'enabled',
    health: 'ok',
  },
  {
    id: 'daily-bread',
    name: 'Daily Bread',
    category: 'Faith',
    description: 'Christian daily reading, stored for offline access.',
    status: 'enabled',
    health: 'ok',
  },
  {
    id: 'archives',
    name: 'Archives',
    category: 'Reference',
    description: 'Offline copies of government and community websites.',
    status: 'enabled',
    health: 'offline',
  },
  {
    id: 'kado',
    name: 'KADO',
    category: 'Messaging',
    description: 'Proposed messaging service. Not yet connected.',
    status: 'disabled',
    health: 'offline',
  },
]

export function findService(id) {
  return SERVICES.find((service) => service.id === id) || null
}

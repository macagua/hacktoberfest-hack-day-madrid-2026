import type { Translation } from './es'

export const en: Translation = {
  meta: {
    description:
      'Standup FM: your GitHub repo told by two radio hosts, as a mini AI-generated podcast.',
  },
  header: {
    onAir: 'On air · 104.3',
    connect: 'Connect with GitHub',
    connectedAs: 'Signed in as {{login}}. Sign out',
    subtitle:
      'Your repo, told by two hosts who didn’t sleep. The daily standup nobody asked for and everyone will listen to.',
  },
  uiLanguage: {
    label: 'Interface language',
    es: 'ES',
    en: 'EN',
    esName: 'Spanish',
    enName: 'English',
  },
  source: {
    title: 'What we cover',
    repo: {
      label: 'Repository',
      connectFirst: 'Connect GitHub to see your repos',
      loading: 'Tuning in to your repos…',
      failed: 'We couldn’t load your repos',
      none: 'No repos found',
      search: 'Search repository',
      searchPlaceholder: 'Search repo…',
      noMatch: 'That repo isn’t on the dial. Try another name.',
    },
    what: 'What we look at',
    who: 'Whose work',
    everyone: 'The whole team',
    from: 'From',
    to: 'To',
    max: 'Maximum (up to {{cap}})',
  },
  style: {
    title: 'How we tell it',
    random: 'Random',
    tone: 'Tone',
    format: 'Format',
    duration: 'Length',
    language: 'Language',
  },
  options: {
    source: { commits: 'Commits', prs: 'PRs', ambos: 'Both' },
    tone: { serio: 'Serious', gracioso: 'Funny', roast: 'Roast' },
    format: {
      podcast: 'Podcast',
      noticiero: 'Newscast',
      futbol: 'Football commentary',
      documental: 'Documentary',
    },
    duration: { '30': '30 s', '60': '1 min', '120': '2 min' },
    language: { es: 'Spanish', en: 'English' },
  },
  generate: 'Generate standup',
  result: {
    title: 'On air',
    idle: {
      title: 'Empty studio, mics off',
      text: 'We already picked everything for you. Hit “Generate standup” and we go live.',
    },
    loading: {
      messages: [
        'Reading embarrassing commits…',
        'Warming up the voices…',
        'Pouring coffee for the hosts…',
        'Translating “wip” into English…',
        'Finding out who broke the build…',
      ],
      hint: 'This takes a few seconds. Don’t touch anything (or do, whatever).',
    },
    player: {
      title: 'This week’s standup',
      download: 'Download MP3',
      play: 'Play',
      pause: 'Pause',
      back: 'Back {{seconds}} seconds',
      forward: 'Forward {{seconds}} seconds',
    },
    script: 'Script',
    error: {
      title: 'We lost the signal',
      text: 'GitHub or the voices didn’t answer. Not your fault (this time). Your options are just as you left them.',
      retry: 'Try again',
    },
    empty: {
      title: 'Radio silence',
      text: 'No commits or PRs match those filters. Either the team is on holiday or the dates need widening.',
      widen: 'Try the last {{days}} days',
    },
  },
  footer: 'Standup FM · made with love by team “CTRL ALT ELITE” for the hackathon',
}

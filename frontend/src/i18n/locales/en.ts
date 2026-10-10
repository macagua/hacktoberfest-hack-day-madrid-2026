import type { Translation } from './es'

export const en: Translation = {
  meta: {
    description:
      'Standup FM: your GitHub repo told by two radio hosts, as a mini AI-generated podcast.',
  },
  header: {
    onAir: 'On air · 104.3',
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
      placeholder: 'owner/name',
      hint: 'Type owner/name or paste the repo’s GitHub URL.',
      invalid: 'That repo isn’t on the dial: it must be owner/name or a GitHub URL.',
    },
    what: 'What we look at',
    who: 'Whose work',
    everyone: 'The whole team',
    from: 'From',
    to: 'To',
    max: 'Maximum PRs (up to {{cap}})',
  },
  style: {
    title: 'How we tell it',
    random: 'Random',
    tone: 'Tone',
    format: 'Format',
    duration: 'Length',
    language: 'Language',
  },
  soon: {
    badge: 'Coming soon',
    hint: 'The backend doesn’t support this yet.',
    tooltip: 'Coming soon: the backend doesn’t support this yet.',
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
      title: '{{repo}} standup',
      maxPrs_one: 'up to {{count}} PR',
      maxPrs_other: 'up to {{count}} PRs',
      download: 'Download MP3',
      play: 'Play',
      pause: 'Pause',
      back: 'Back {{seconds}} seconds',
      forward: 'Forward {{seconds}} seconds',
    },
    noAudio: {
      text: 'No voice this time: the backend couldn’t generate the audio. The script and PRs are all here.',
    },
    script: 'Script',
    narrator: 'Host',
    prs: {
      title: 'Pull requests by priority',
      open_one: '{{count}} open',
      open_other: '{{count}} open',
      level: { alta: 'High', media: 'Medium', baja: 'Low' },
      status: {
        listo_para_merge: 'Ready to merge',
        necesita_revision: 'Needs review',
        cambios_solicitados: 'Changes requested',
        ci_fallando: 'CI failing',
        conflictos: 'Has conflicts',
        borrador: 'Draft',
        en_curso: 'In progress',
      },
      points_one: '{{count}} point',
      points_other: '{{count}} points',
      age_one: 'opened {{count}} day ago',
      age_other: 'opened {{count}} days ago',
      idle_one: '{{count}} day idle',
      idle_other: '{{count}} days idle',
      next: 'Next step',
      why_one: 'Why ({{count}} reason)',
      why_other: 'Why ({{count}} reasons)',
    },
    error: {
      title: 'We lost the signal',
      kind: {
        'repo-no-encontrado':
          'We couldn’t find that repo on GitHub. Check the name (or, if it’s private, the backend needs access).',
        'repo-invalido': 'That repo name isn’t valid: try owner/name.',
        'limite-github': 'GitHub rate-limited us. Wait a bit or set a token on the backend.',
        'fallo-github': 'GitHub didn’t answer properly. Not your fault (this time).',
        'sin-conexion': 'We couldn’t reach the backend. Is it running?',
        desconocido:
          'Something went wrong on the other side. Your options are just as you left them.',
      },
      retry: 'Try again',
      changeRepo: 'Change repo',
    },
    empty: {
      title: 'Radio silence',
      text: 'This repo has no open pull requests. Either everything is merged or the team is on holiday.',
      changeRepo: 'Try another repo',
    },
  },
  footer: 'Standup FM · made with love by team “CTRL ALT ELITE” for the hackathon',
}

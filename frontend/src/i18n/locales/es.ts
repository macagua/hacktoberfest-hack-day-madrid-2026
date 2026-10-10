// Español rioplatense: es el idioma de referencia. Toda clave nueva se agrega acá primero;
// `en.ts` está tipado contra este archivo, así que si falta una traducción no compila.
export const es = {
  meta: {
    description:
      'Standup FM: tu repo de GitHub contado por dos locutores, en un mini podcast generado con IA.',
  },
  header: {
    onAir: 'En el aire · 104.3',
    connect: 'Conectar con GitHub',
    connectedAs: 'Conectado como {{login}}. Desconectar',
    subtitle:
      'Tu repo, contado por dos locutores que no durmieron. La daily que nadie pidió y todos van a escuchar.',
  },
  uiLanguage: {
    label: 'Idioma de la interfaz',
    es: 'ES',
    en: 'EN',
    esName: 'Español',
    enName: 'Inglés',
  },
  source: {
    title: 'Qué resumimos',
    repo: {
      label: 'Repositorio',
      connectFirst: 'Conectá GitHub para ver tus repos',
      loading: 'Sintonizando tus repos…',
      failed: 'No pudimos traer tus repos',
      none: 'No encontramos repos',
      search: 'Buscar repositorio',
      searchPlaceholder: 'Buscar repo…',
      noMatch: 'Ese repo no sintoniza. Probá con otro nombre.',
    },
    what: 'Qué miramos',
    who: 'De quién',
    everyone: 'Todo el equipo',
    from: 'Desde',
    to: 'Hasta',
    max: 'Máximo (tope {{cap}})',
  },
  style: {
    title: 'Cómo lo contamos',
    random: 'Aleatorio',
    tone: 'Tono',
    format: 'Formato',
    duration: 'Duración',
    language: 'Idioma',
  },
  options: {
    source: { commits: 'Commits', prs: 'PRs', ambos: 'Ambos' },
    tone: { serio: 'Serio', gracioso: 'Gracioso', roast: 'Roast' },
    format: {
      podcast: 'Podcast',
      noticiero: 'Noticiero',
      futbol: 'Relato de fútbol',
      documental: 'Documental',
    },
    duration: { '30': '30 s', '60': '1 min', '120': '2 min' },
    language: { es: 'Español', en: 'Inglés' },
  },
  generate: 'Generar standup',
  result: {
    title: 'Al aire',
    idle: {
      title: 'Estudio vacío, micrófonos apagados',
      text: 'Ya está todo elegido por vos. Apretá «Generar standup» y salimos al aire.',
    },
    loading: {
      messages: [
        'Leyendo commits vergonzosos…',
        'Afinando las voces…',
        'Sirviendo café a los locutores…',
        'Traduciendo «wip» al castellano…',
        'Buscando quién rompió el build…',
      ],
      hint: 'Esto tarda unos segundos. No toques nada (o sí, total).',
    },
    player: {
      title: 'Standup de la semana',
      download: 'Descargar MP3',
      play: 'Reproducir',
      pause: 'Pausar',
      back: 'Retroceder {{seconds}} segundos',
      forward: 'Adelantar {{seconds}} segundos',
    },
    script: 'Guion',
    error: {
      title: 'Se nos cortó la transmisión',
      text: 'GitHub o las voces no contestaron. No es tu culpa (esta vez). Tus opciones siguen como las dejaste.',
      retry: 'Reintentar',
    },
    empty: {
      title: 'Silencio de radio',
      text: 'No encontramos commits ni PRs con esos filtros. O el equipo está de vacaciones, o hay que abrir un poco las fechas.',
      widen: 'Probar con los últimos {{days}} días',
    },
  },
  footer: 'Standup FM · hecho con amor por el equipo «CTRL ALT ELITE» para el hackatón',
}

/** Misma forma que `es`, con cualquier texto en las hojas. */
type DeepStrings<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly string[]
      ? readonly string[]
      : DeepStrings<T[K]>
}

export type Translation = DeepStrings<typeof es>

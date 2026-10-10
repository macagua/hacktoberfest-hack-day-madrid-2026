// Español rioplatense: es el idioma de referencia. Toda clave nueva se agrega acá primero;
// `en.ts` está tipado contra este archivo, así que si falta una traducción no compila.
export const es = {
  meta: {
    description:
      'Standup FM: tu repo de GitHub contado por dos locutores, en un mini podcast generado con IA.',
  },
  header: {
    onAir: 'En el aire · 104.3',
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
      placeholder: 'owner/nombre',
      hint: 'Escribí owner/nombre o pegá la URL del repo en GitHub.',
      invalid: 'Ese repo no sintoniza: tiene que ser owner/nombre o la URL de GitHub.',
    },
    what: 'Qué miramos',
    who: 'De quién',
    everyone: 'Todo el equipo',
    from: 'Desde',
    to: 'Hasta',
    max: 'Máximo de PRs (tope {{cap}})',
  },
  style: {
    title: 'Cómo lo contamos',
    random: 'Aleatorio',
    tone: 'Tono',
    format: 'Formato',
    duration: 'Duración',
    language: 'Idioma',
  },
  soon: {
    badge: 'Próximamente',
    hint: 'Todavía no lo soporta el backend.',
    tooltip: 'Próximamente: el backend todavía no lo soporta.',
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
      title: 'Standup de {{repo}}',
      maxPrs_one: 'hasta {{count}} PR',
      maxPrs_other: 'hasta {{count}} PRs',
      download: 'Descargar MP3',
      play: 'Reproducir',
      pause: 'Pausar',
      back: 'Retroceder {{seconds}} segundos',
      forward: 'Adelantar {{seconds}} segundos',
    },
    noAudio: {
      text: 'Esta vez sale sin voz: el backend no pudo generar el audio. El guion y las PRs están igual.',
    },
    script: 'Guion',
    narrator: 'Locutor',
    prs: {
      title: 'Pull requests por prioridad',
      open_one: '{{count}} abierta',
      open_other: '{{count}} abiertas',
      level: { alta: 'Alta', media: 'Media', baja: 'Baja' },
      status: {
        listo_para_merge: 'Lista para merge',
        necesita_revision: 'Necesita revisión',
        cambios_solicitados: 'Cambios solicitados',
        ci_fallando: 'CI fallando',
        conflictos: 'Con conflictos',
        borrador: 'Borrador',
        en_curso: 'En curso',
      },
      points_one: '{{count}} punto',
      points_other: '{{count}} puntos',
      age_one: 'abierta hace {{count}} día',
      age_other: 'abierta hace {{count}} días',
      idle_one: '{{count}} día sin movimiento',
      idle_other: '{{count}} días sin movimiento',
      next: 'Siguiente paso',
      why_one: 'Por qué ({{count}} motivo)',
      why_other: 'Por qué ({{count}} motivos)',
    },
    error: {
      title: 'Se nos cortó la transmisión',
      kind: {
        'repo-no-encontrado':
          'No encontramos ese repo en GitHub. Revisá el nombre (o si es privado, el backend necesita acceso).',
        'repo-invalido': 'Ese nombre de repo no tiene buen formato: probá con owner/nombre.',
        'limite-github':
          'GitHub nos cortó por exceso de pedidos. Esperá un rato o configurá un token en el backend.',
        'fallo-github': 'GitHub no contestó bien. No es tu culpa (esta vez).',
        'sin-conexion': 'No pudimos hablar con el backend. ¿Está levantado?',
        desconocido: 'Algo salió mal del otro lado. Tus opciones siguen como las dejaste.',
      },
      retry: 'Reintentar',
      changeRepo: 'Cambiar de repo',
    },
    empty: {
      title: 'Silencio de radio',
      text: 'Este repo no tiene pull requests abiertas. O está todo mergeado, o el equipo está de vacaciones.',
      changeRepo: 'Probar con otro repo',
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

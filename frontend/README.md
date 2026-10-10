# Standup FM · frontend

React + Vite + TypeScript (strict) + TanStack Query.

## Arrancar

```bash
pnpm install
pnpm dev
```

Por defecto todo funciona con datos simulados (`VITE_USE_MOCK=true`): un clic en «Generar standup» y sale al aire.

| Script           | Qué hace                        |
| ---------------- | ------------------------------- |
| `pnpm dev`       | servidor de desarrollo          |
| `pnpm build`     | typecheck + build de producción |
| `pnpm lint`      | ESLint                          |
| `pnpm typecheck` | `tsc --noEmit`                  |
| `pnpm test`      | Vitest + Testing Library        |
| `pnpm format`    | Prettier                        |

### Forzar estados con el mock

- `?mock=error` → «Se nos cortó la transmisión»
- `?mock=vacio` → «Silencio de radio»
- `?mock=desconectado` → arranca sin sesión de GitHub

## Estructura

```
src/
├── main.tsx                 punto de entrada: i18n, TanStack Query y estilos globales
├── app/                     composición de la pantalla (App) y su test de integración
├── features/                una carpeta por funcionalidad, con su API pública en index.ts
│   ├── github/              sesión, repos y colaboradores (useGitHub, RepoSelect, SessionButton)
│   ├── standup-form/        bloques 01 y 02, botón principal y lógica de opciones
│   └── standup-result/      bloque 03: estados, reproductor, guion, useStandup y useAudioPlayer
├── components/              piezas compartidas sin lógica de negocio (Header, Panel, LanguageSwitcher, icons)
├── api/                     cliente HTTP: backend, GitHub directo, mock y validación de respuestas
├── i18n/                    configuración de i18next y diccionarios (es, en)
├── lib/                     utilidades genéricas (cx, queryClient)
├── styles/                  tokens de diseño, estilos globales y piezas de formulario
├── test/                    setup de Vitest y helpers
└── types.ts                 tipos de dominio compartidos
```

Cada componente vive en su carpeta: `Componente.tsx`, `Componente.module.css` e `index.ts`.

Reglas:

- **Imports**: dentro de una feature se usan rutas relativas; entre features, solo `@/features/<nombre>` (lo controla ESLint). Lo compartido se importa con el alias `@/`.
- **Composición antes que acoplamiento**: si un bloque necesita algo de otra feature, lo recibe como prop o slot (por ejemplo, `SourceBlock` recibe el selector de repo desde `App`).
- **Estilos**: CSS Modules con las variables de `styles/tokens.css`. Para extender una clase de otro archivo se usa `composes`, que garantiza el orden de carga.

## Idiomas (i18n)

[i18next](https://www.i18next.com/) + `react-i18next`. La interfaz está en español (rioplatense, idioma de referencia) e inglés.

- Diccionarios en `src/i18n/locales/`. Las claves nuevas se agregan primero en `es.ts`; `en.ts` está tipado contra ese archivo, así que si falta una traducción no compila. Un test además verifica que las claves coincidan.
- `t('clave')` está tipado: una clave inexistente es un error de TypeScript.
- El idioma se detecta en este orden: `?lang=en` en la URL, la última elección (localStorage) y el idioma del navegador. Por defecto, español.
- El selector ES/EN de la cabecera cambia la interfaz. El idioma del podcast es otra opción, del bloque «Cómo lo contamos», y arranca igual al de la interfaz.

## De dónde salen los datos

Todo pasa por [`src/api/client.ts`](src/api/client.ts). Copiá `.env.example` a `.env.local`:

| Variables                 | Datos de GitHub (usuario, repos, colaboradores) | Generación del standup        |
| ------------------------- | ----------------------------------------------- | ----------------------------- |
| nada (por defecto)        | mock                                            | mock                          |
| `VITE_GITHUB_TOKEN=ghp_…` | API de GitHub directa con tu token              | mock                          |
| `VITE_USE_MOCK=false`     | backend (`/api/me`, `/api/repos`, …)            | backend (`POST /api/standup`) |

`VITE_API_PROXY_TARGET=http://localhost:8000` hace que el dev server reenvíe `/api` al backend.

### Login con GitHub: lo hace el backend

El flujo OAuth necesita el `client_secret` de la GitHub App/OAuth App para canjear el código por un token, y ese secreto no puede vivir en el navegador (todo lo que va en el bundle es público). Por eso:

1. El botón «Conectar con GitHub» solo redirige a `/api/auth/github`.
2. El backend hace el OAuth, guarda el token del lado del servidor y deja una cookie de sesión `httpOnly`.
3. El front llama a `/api/me`, `/api/repos`, etc. con `credentials: 'include'`.

`VITE_GITHUB_TOKEN` es solo un atajo para desarrollar con repos reales mientras el backend no existe. Nunca lo configures en un deploy.

## Contrato con el backend

Todo bajo `/api`, con la cookie de sesión (`credentials: 'include'`):

| Método y ruta                              | Respuesta                                                           |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `GET /api/auth/github`                     | Inicia el OAuth con GitHub y vuelve a la app con la sesión iniciada |
| `GET /api/me`                              | `{ login, avatarUrl }` o `401` si no hay sesión                     |
| `GET /api/repos`                           | `[{ fullName }]`                                                    |
| `GET /api/repos/:owner/:repo/contributors` | `[{ login }]`                                                       |
| `POST /api/standup`                        | ver abajo                                                           |

Cuerpo de `POST /api/standup` (`author: null` = todo el equipo; fechas `YYYY-MM-DD`):

```json
{
  "repo": "owner/nombre",
  "source": "commits | prs | ambos",
  "author": "login | null",
  "from": "2026-10-03",
  "to": "2026-10-10",
  "max": 30,
  "tone": "serio | gracioso | roast",
  "format": "podcast | noticiero | futbol | documental",
  "duration": 30,
  "language": "es | en"
}
```

Respuesta: `{ audioUrl, durationSec, lines: [{ speaker: "a" | "b", name, text, startSec }] }`, o `204` si no hubo actividad (estado «Silencio de radio»). Cualquier otro error muestra «Se nos cortó la transmisión». La línea activa del guion se calcula con `startSec` contra el tiempo del `<audio>`.

## Pendiente con el backend

- [ ] `GET /api/me`, `GET /api/repos`, `GET /api/repos/:owner/:repo/contributors`.
- [ ] `POST /api/standup` → `{ audioUrl, durationSec, lines }` o `204` si no hay actividad.
- [ ] `GET /api/auth/github` (inicio del OAuth y callback).
- [ ] `POST /api/auth/logout`: no está en el contrato; el front ya lo llama. Acordarlo.
- [ ] Picos de audio para la forma de onda (hoy es decorativa).

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "false" para hablar con el backend real. Cualquier otro valor (o vacío) usa el mock. */
  readonly VITE_USE_MOCK?: string
  /** Token personal de GitHub, solo para desarrollo local. Ver `.env.example`. */
  readonly VITE_GITHUB_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del backend en producción. En desarrollo se usa `/api` con el proxy de Vite. */
  readonly VITE_API_URL?: string
  /** Repo que aparece precargado en el formulario. */
  readonly VITE_DEFAULT_REPO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

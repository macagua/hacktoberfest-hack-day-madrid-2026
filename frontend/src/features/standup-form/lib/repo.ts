// Misma regla que el backend (backend/app/schemas.py): `owner/nombre` o la URL del repo en GitHub.
const REPO_PATTERN = /^(?:https?:\/\/(?:www\.)?github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/

/**
 * Normaliza lo que se escribió en el campo de repositorio a `owner/nombre`.
 * Devuelve null si no tiene un formato válido.
 */
export function normalizeRepo(raw: string): string | null {
  const match = REPO_PATTERN.exec(raw.trim())
  if (!match) return null
  const [, owner, name] = match
  return owner && name ? `${owner}/${name}` : null
}

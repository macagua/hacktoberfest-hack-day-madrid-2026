import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createMockClient, type MockOptions } from '@/api/mock'
import App from './App'
import { createWrapper } from '@/test/utils'

function renderApp(options: MockOptions = {}) {
  const client = createMockClient({ delayMs: 20, ...options })
  return render(<App client={client} />, { wrapper: createWrapper() })
}

function resultZone() {
  return screen.getByRole('region', { name: 'Al aire' })
}

describe('App (con el mock)', () => {
  it('con un solo clic genera el standup y muestra reproductor y guion', async () => {
    const user = userEvent.setup()
    renderApp()

    await screen.findByRole('button', { name: /Conectado como tu-usuario/ })
    expect(await screen.findByText('tu-usuario/standup-fm')).toBeInTheDocument()
    expect(within(resultZone()).getByText('Estudio vacío, micrófonos apagados')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Generar standup' }))
    expect(within(resultZone()).getByRole('status')).toBeInTheDocument()

    expect(await screen.findByText('Standup de la semana')).toBeInTheDocument()
    expect(screen.getByText('Gracioso · Podcast · 1 min · Español')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reproducir|Pausar/ })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(8)
  })

  it('muestra el error y permite reintentar sin perder las opciones', async () => {
    const user = userEvent.setup()
    renderApp({ outcome: 'error' })
    await screen.findByText('tu-usuario/standup-fm')

    await user.click(screen.getByRole('button', { name: 'Roast' }))
    await user.click(screen.getByRole('button', { name: 'Generar standup' }))
    expect(await screen.findByText('Se nos cortó la transmisión')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Roast' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Se nos cortó la transmisión')).toBeInTheDocument()
  })

  it('sin resultados ofrece ampliar a 30 días', async () => {
    const user = userEvent.setup()
    renderApp({ outcome: 'sin-resultados' })
    await screen.findByText('tu-usuario/standup-fm')

    await user.click(screen.getByRole('button', { name: 'Generar standup' }))
    await user.click(await screen.findByRole('button', { name: 'Probar con los últimos 30 días' }))

    const from = screen.getByLabelText<HTMLInputElement>('Desde').value
    const to = screen.getByLabelText<HTMLInputElement>('Hasta').value
    const days = (Date.parse(to) - Date.parse(from)) / 86_400_000
    expect(days).toBe(30)
    expect(await screen.findByText('Silencio de radio')).toBeInTheDocument()
  })

  it('sin sesión pide conectar GitHub', async () => {
    const user = userEvent.setup()
    renderApp({ connected: false })

    const connect = await screen.findByRole('button', { name: 'Conectar con GitHub' })
    expect(screen.getByText('Conectá GitHub para ver tus repos')).toBeInTheDocument()
    await user.click(connect)
    expect(await screen.findByText('tu-usuario/standup-fm')).toBeInTheDocument()
  })

  it('el buscador de repos filtra y avisa cuando no hay coincidencias', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(await screen.findByRole('button', { name: 'Repositorio' }))

    const search = screen.getByRole('searchbox', { name: 'Buscar repositorio' })
    await user.type(search, 'equipo')
    expect(screen.getByRole('button', { name: 'tu-equipo/app-mobile' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'tu-usuario/landing' })).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'zzz')
    expect(screen.getByText('Ese repo no sintoniza. Probá con otro nombre.')).toBeInTheDocument()
  })

  it('el máximo se recorta al tope', async () => {
    const user = userEvent.setup()
    renderApp()
    const max = screen.getByLabelText<HTMLInputElement>('Máximo (tope 100)')
    await user.clear(max)
    await user.type(max, '250')
    expect(max.value).toBe('100')
  })

  it('cambia el idioma de la interfaz y el podcast sale en ese idioma', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByText('tu-usuario/standup-fm')

    const switcher = screen.getByRole('group', { name: 'Idioma de la interfaz' })
    await user.click(within(switcher).getByRole('button', { name: 'Inglés' }))
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('button', { name: 'Generate standup' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('group', { name: 'Interface language' })).getByRole('button', {
        name: 'English',
      }),
    ).toHaveAttribute('aria-pressed', 'true')

    // El idioma del podcast es una opción aparte: lo pasamos a inglés y generamos.
    await user.click(
      within(screen.getByRole('group', { name: 'Language' })).getByRole('button', {
        name: 'English',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Generate standup' }))
    expect(await screen.findByText('This week’s standup')).toBeInTheDocument()
    expect(screen.getByText('Funny · Podcast · 1 min · English')).toBeInTheDocument()
    expect(screen.getByText('Spoiler: it was not final.')).toBeInTheDocument()
  })
})

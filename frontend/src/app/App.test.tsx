import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createFakeClient, type FakeClientOptions } from '@/test/fakeClient'
import { createWrapper } from '@/test/utils'
import App from './App'

function renderApp(options: FakeClientOptions = {}) {
  return render(<App client={createFakeClient(options)} />, { wrapper: createWrapper() })
}

function resultZone() {
  return screen.getByRole('region', { name: 'Al aire' })
}

function repoInput() {
  return screen.getByRole('textbox', { name: 'Repositorio' })
}

describe('App', () => {
  it('con un solo clic genera el standup: reproductor, guion y PRs por prioridad', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(repoInput()).toHaveValue('macagua/hacktoberfest-hack-day-madrid-2026')
    expect(within(resultZone()).getByText('Estudio vacío, micrófonos apagados')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Generar standup' }))

    expect(
      await screen.findByText('Standup de macagua/hacktoberfest-hack-day-madrid-2026'),
    ).toBeInTheDocument()
    expect(screen.getByText('Español · hasta 30 PRs')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reproducir|Pausar/ })).toBeInTheDocument()

    const prs = screen.getByRole('region', { name: 'Pull requests por prioridad' })
    expect(within(prs).getByRole('link', { name: '#12 Arreglar login' })).toHaveAttribute(
      'href',
      'https://github.com/acme/demo/pull/12',
    )
    expect(within(prs).getByText('CI fallando')).toBeInTheDocument()
    expect(within(prs).getByText('Arreglar los checks que fallan')).toBeInTheDocument()
  })

  it('sin audio muestra el aviso y el guion igual', async () => {
    const user = userEvent.setup()
    renderApp({ withAudio: false })
    await user.click(screen.getByRole('button', { name: 'Generar standup' }))

    expect(await screen.findByText(/Esta vez sale sin voz/)).toBeInTheDocument()
    expect(screen.getByText('Falta ELEVENLABS_API_KEY')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reproducir|Pausar/ })).not.toBeInTheDocument()
    expect(screen.getByText('Eso es todo.')).toBeInTheDocument()
  })

  it('valida el repo antes de llamar al backend', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.clear(repoInput())
    await user.type(repoInput(), 'esto no es un repo')
    await user.click(screen.getByRole('button', { name: 'Generar standup' }))

    expect(repoInput()).toHaveAttribute('aria-invalid', 'true')
    expect(repoInput()).toHaveFocus()
    expect(within(resultZone()).getByText('Estudio vacío, micrófonos apagados')).toBeInTheDocument()

    await user.type(repoInput(), 'x')
    expect(repoInput()).toHaveAttribute('aria-invalid', 'false')
  })

  it('si el repo no existe ofrece cambiarlo', async () => {
    const user = userEvent.setup()
    renderApp({ outcome: 'repo-no-encontrado' })
    await user.click(screen.getByRole('button', { name: 'Generar standup' }))

    expect(await screen.findByText(/No encontramos ese repo en GitHub/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cambiar de repo' }))
    expect(repoInput()).toHaveFocus()
  })

  it('si el backend está caído permite reintentar', async () => {
    const user = userEvent.setup()
    renderApp({ outcome: 'sin-conexion' })
    await user.click(screen.getByRole('button', { name: 'Generar standup' }))

    expect(await screen.findByText(/No pudimos hablar con el backend/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText(/No pudimos hablar con el backend/)).toBeInTheDocument()
  })

  it('un repo sin PRs abiertas muestra «Silencio de radio»', async () => {
    const user = userEvent.setup()
    renderApp({ outcome: 'sin-resultados' })
    await user.click(screen.getByRole('button', { name: 'Generar standup' }))

    expect(await screen.findByText('Silencio de radio')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Probar con otro repo' }))
    expect(repoInput()).toHaveFocus()
  })

  it('lo que el backend no soporta queda desactivado como «Próximamente»', () => {
    renderApp()
    expect(screen.getByRole('button', { name: 'Roast' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Podcast/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Commits' })).toBeDisabled()
    expect(screen.getByLabelText('Desde')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Aleatorio' })).toBeDisabled()
    expect(screen.getAllByText('Próximamente').length).toBeGreaterThan(0)

    // Lo que sí funciona sigue activo.
    expect(screen.getByLabelText('Máximo de PRs (tope 100)')).toBeEnabled()
    const language = screen.getByRole('group', { name: 'Idioma' })
    expect(within(language).getByRole('button', { name: 'Inglés' })).toBeEnabled()
  })

  it('el máximo se recorta al tope', async () => {
    const user = userEvent.setup()
    renderApp()
    const max = screen.getByLabelText<HTMLInputElement>('Máximo de PRs (tope 100)')
    await user.clear(max)
    await user.type(max, '250')
    expect(max.value).toBe('100')
  })

  it('cambia el idioma de la interfaz y el podcast se pide en ese idioma', async () => {
    const user = userEvent.setup()
    renderApp()

    const switcher = screen.getByRole('group', { name: 'Idioma de la interfaz' })
    await user.click(within(switcher).getByRole('button', { name: 'Inglés' }))
    expect(document.documentElement.lang).toBe('en')

    const language = screen.getByRole('group', { name: 'Language' })
    await user.click(within(language).getByRole('button', { name: 'English' }))
    await user.click(screen.getByRole('button', { name: 'Generate standup' }))

    expect(await screen.findByText('English · up to 30 PRs')).toBeInTheDocument()
    expect(screen.getByText('That is all.')).toBeInTheDocument()
  })
})

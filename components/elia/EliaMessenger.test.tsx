import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EliaMessenger from '@/components/elia/EliaMessenger'
import { ELIA_CONSENT_KEY, ELIA_SESSION_KEY } from '@/lib/eliaSession'

function sseResponse(events: unknown[]) {
  const body = events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('')
  return new Response(body, { headers: { 'content-type': 'text/event-stream' } })
}

const completeState = {
  type: 'distance', departure: 'Nîmes', destination: 'Montpellier',
  date: '2026-12-15', time: '09:30', passengers: '2', options: [],
  payment: 'Carte bancaire', name: 'Ada Lovelace', phone: '0612345678',
  email: 'ada@example.com',
}

function persisted(overrides: Record<string, unknown> = {}) {
  return {
    messages: [{ id: 'a', role: 'assistant', content: 'Bonjour', createdAt: new Date().toISOString() }],
    draft: '', collectedState: {}, userMessageCount: 0, isOpen: true,
    readyForConfirmation: false, quickReplies: [], consentProof: 'proof.payload.signature',
    updatedAt: Date.now(), ...overrides,
  }
}

describe('EliaMessenger', () => {
  beforeEach(() => {
    vi.useRealTimers()
    window.scrollTo = vi.fn()
    document.body.style.cssText = ''
    sessionStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.open = true })
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.open = false })
    window.history.replaceState({}, '', '/')
  })

  it('ouvre automatiquement Élia depuis le lien global dédié', async () => {
    window.history.replaceState({}, '', '/?elia=open#contact')
    render(<EliaMessenger greeting="Bonjour" />)
    expect(await screen.findByRole('dialog', { name: /conversation avec élia/i })).toBeInTheDocument()
  })

  it('exige le consentement avant le premier message et expose un dialogue accessible', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ consentProof: 'proofpayload.signature' }), { status: 201 }))
    render(<EliaMessenger greeting="Bonjour" />)
    const trigger = await screen.findByRole('button', { name: /ouvrir la conversation avec élia/i })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: /conversation avec élia/i })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).queryByRole('textbox', { name: /votre réponse/i })).not.toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: /politique de confidentialité/i })).toHaveAttribute('href', '/politique-de-confidentialite')

    await user.click(within(dialog).getByRole('button', { name: /accepter et commencer/i }))
    expect(sessionStorage.getItem(ELIA_CONSENT_KEY)).toBe('true')
    expect(await within(dialog).findByRole('textbox', { name: /votre réponse/i })).toBeEnabled()
    expect(fetch).toHaveBeenCalledWith('/api/chat/consent', expect.objectContaining({ method: 'POST' }))
  })

  it('ferme avec Échap, restaure le focus et conserve la conversation à la réouverture', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({ isOpen: false })))
    render(<EliaMessenger greeting="Bonjour" />)
    const trigger = await screen.findByRole('button', { name: /ouvrir la conversation avec élia/i })
    await user.click(trigger)
    const input = screen.getByRole('textbox', { name: /votre réponse/i })
    await user.type(input, 'Mon brouillon')
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(trigger).toHaveFocus()
    await user.click(trigger)
    expect(screen.getByRole('textbox', { name: /votre réponse/i })).toHaveValue('Mon brouillon')
  })

  it('attend une confirmation explicite avant /api/devis puis purge la session après succès', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({ isOpen: false })))
    vi.mocked(fetch)
      .mockResolvedValueOnce(sseResponse([
        { type: 'delta', text: 'Voici votre récapitulatif.' },
        { type: 'done', collectedState: completeState, quickReplies: [], readyForConfirmation: true, devisToken: 'token' },
      ]))
      .mockResolvedValueOnce(new Response(JSON.stringify({ reference: 'DEV-42', priceEur: 120 }), { status: 201 }))

    render(<EliaMessenger greeting="Bonjour" />)
    await user.click(await screen.findByRole('button', { name: /ouvrir la conversation/i }))
    await user.type(screen.getByRole('textbox', { name: /votre réponse/i }), 'Tout est correct')
    await user.click(screen.getByRole('button', { name: 'Envoyer' }))

    const confirm = await screen.findByRole('button', { name: 'Confirmer' })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/chat')
    await user.click(confirm)
    await screen.findByText(/DEV-42/)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(vi.mocked(fetch).mock.calls[1][0]).toBe('/api/devis')
    expect(sessionStorage.getItem(ELIA_SESSION_KEY)).toBeNull()
  })

  it('envoie une intention de correction ciblée sans réinitialiser la conversation', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({ collectedState: { time: '09:30', date: '2026-12-15' } })))
    vi.mocked(fetch).mockResolvedValue(sseResponse([
      { type: 'delta', text: 'Quelle est la nouvelle heure ?' },
      { type: 'done', collectedState: { date: '2026-12-15' }, quickReplies: [], readyForConfirmation: false },
    ]))

    render(<EliaMessenger greeting="Bonjour" />)
    const panel = await screen.findByRole('button', { name: /informations recueillies/i })
    await user.click(panel)
    await user.click(screen.getByRole('button', { name: /corriger l’heure/i }))
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
    const request = vi.mocked(fetch).mock.calls[0][1] as RequestInit
    expect(String(request.body)).toContain('Je souhaite corriger l’heure')
    expect(screen.getByText('Bonjour')).toBeInTheDocument()
    expect(screen.getByText('Quelle est la nouvelle heure ?')).toBeInTheDocument()
  })

  it('bloque le 31e message côté client sans requête réseau', async () => {
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    const messages = Array.from({ length: 30 }, (_, index) => [
      { id: `u${index}`, role: 'user', content: `r${index}` },
      { id: `a${index}`, role: 'assistant', content: `q${index}` },
    ]).flat()
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({ messages, userMessageCount: 30 })))
    render(<EliaMessenger greeting="Bonjour" />)
    expect(await screen.findByText(/limite de 30 messages atteinte/i)).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /votre réponse/i })).toBeDisabled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('ne rejoue ni ne persiste une donnée sensible saisie', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted()))
    vi.mocked(fetch).mockResolvedValueOnce(sseResponse([
      { type: 'delta', text: 'Message normal reçu.' },
      { type: 'done', collectedState: {}, quickReplies: [], readyForConfirmation: false, historyToken: 'history.payload.signature' },
    ]))
    const view = render(<EliaMessenger greeting="Bonjour" />)
    await user.click(await screen.findByRole('button', { name: /ouvrir la conversation/i }))
    await user.type(screen.getByRole('textbox', { name: /votre réponse/i }), 'carte 4242 4242 4242 4242')
    await user.click(screen.getByRole('button', { name: 'Envoyer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Ne partagez jamais/)
    expect(screen.queryByText(/4242/)).not.toBeInTheDocument()
    expect(sessionStorage.getItem(ELIA_SESSION_KEY)).not.toContain('4242')
    expect(fetch).not.toHaveBeenCalled()
    await user.type(screen.getByRole('textbox', { name: /votre réponse/i }), 'Trajet normal')
    await user.click(screen.getByRole('button', { name: 'Envoyer' }))
    expect(await screen.findByText('Message normal reçu.')).toBeInTheDocument()
    const request = vi.mocked(fetch).mock.calls[0][1] as RequestInit
    expect(JSON.parse(String(request.body)).messages).toEqual([{ role: 'user', content: 'Trajet normal' }])
    await waitFor(() => expect(JSON.parse(sessionStorage.getItem(ELIA_SESSION_KEY)!).userMessageCount).toBe(1))
    const stored = JSON.parse(sessionStorage.getItem(ELIA_SESSION_KEY)!)
    expect(stored.messages).not.toEqual(expect.arrayContaining([expect.objectContaining({ content: expect.stringMatching(/Ne partagez jamais/) })]))
    view.unmount()
    render(<EliaMessenger greeting="Bonjour" />)
    expect(await screen.findByText('Message normal reçu.')).toBeInTheDocument()
  })

  it('permet une correction ciblée directement depuis l’état de confirmation', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({ isOpen: false })))
    vi.mocked(fetch)
      .mockResolvedValueOnce(sseResponse([{ type: 'delta', text: 'Récapitulatif.' }, { type: 'done', collectedState: completeState, quickReplies: [], readyForConfirmation: true, devisToken: 'token' }]))
      .mockResolvedValueOnce(sseResponse([{ type: 'delta', text: 'Nouvelle heure ?' }, { type: 'done', collectedState: { ...completeState, time: undefined }, quickReplies: [], readyForConfirmation: false }]))
    render(<EliaMessenger greeting="Bonjour" />)
    await user.click(await screen.findByRole('button', { name: /ouvrir la conversation/i }))
    await user.type(screen.getByRole('textbox', { name: /votre réponse/i }), 'Mes informations')
    await user.click(screen.getByRole('button', { name: 'Envoyer' }))
    await screen.findByRole('button', { name: 'Confirmer' })
    await user.click(screen.getByRole('button', { name: /^Corriger$/ }))
    const chooser = await screen.findByRole('group', { name: /champ à corriger/i })
    await user.click(within(chooser).getByRole('button', { name: 'Corriger l’heure' }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Nouvelle heure ?')).toBeInTheDocument()
  })

  it('restaure confirmation, token et réponses rapides puis les purge après succès', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({
      collectedState: completeState, readyForConfirmation: true, devisToken: 'devis.payload.signature',
      quickReplies: ['Oui'], historyToken: 'history.payload.signature',
    })))
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ reference: 'DEV-RESTORED', priceEur: 99 }), { status: 201 }))
    render(<EliaMessenger greeting="Bonjour" />)
    expect(await screen.findByRole('button', { name: 'Confirmer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Oui' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmer' }))
    await screen.findByText(/DEV-RESTORED/)
    expect(sessionStorage.getItem(ELIA_SESSION_KEY)).toBeNull()
  })

  it('fusionne l’état progressif et retire le champ dès une correction ciblée', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({ collectedState: { time: '09:30', date: '2026-12-15' } })))
    vi.mocked(fetch).mockResolvedValueOnce(sseResponse([
      { type: 'delta', text: 'Nouvelle heure ?' },
      { type: 'done', collectedState: {}, quickReplies: [], readyForConfirmation: false, historyToken: 'next.payload.signature' },
    ]))
    render(<EliaMessenger greeting="Bonjour" />)
    await user.click(await screen.findByRole('button', { name: /informations recueillies/i }))
    await user.click(screen.getByRole('button', { name: /corriger l’heure/i }))
    await screen.findByText('Nouvelle heure ?')
    expect(screen.queryByText('09:30')).not.toBeInTheDocument()
    expect(screen.getByText('2026-12-15')).toBeInTheDocument()
  })

  it('ne duplique pas le menu d’action global avec un second bouton flottant Élia', async () => {
    render(<section id="contact"><EliaMessenger greeting="Bonjour" /></section>)
    await screen.findByRole('button', { name: /ouvrir la conversation/i })
    expect(screen.queryByText('Parler à Élia')).not.toBeInTheDocument()
  })

  it('gère visualViewport resize/scroll et restaure exactement body et scroll au cleanup', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({ isOpen: false })))
    const listeners = new Map<string, EventListener>()
    const viewport = {
      height: 600, offsetTop: 20,
      addEventListener: vi.fn((type: string, listener: EventListener) => listeners.set(type, listener)),
      removeEventListener: vi.fn((type: string, listener: EventListener) => {
        if (listeners.get(type) === listener) listeners.delete(type)
      }),
    }
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 321 })
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    document.body.style.overflow = 'clip'
    document.body.style.position = 'relative'
    render(<EliaMessenger greeting="Bonjour" />)
    await user.click(await screen.findByRole('button', { name: /ouvrir la conversation/i }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveStyle({ '--elia-viewport-height': '600px', '--elia-viewport-offset': '20px' })
    expect(viewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(viewport.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    listeners.get('scroll')!(new Event('scroll'))
    await user.click(screen.getByRole('button', { name: /fermer la conversation/i }))
    expect(viewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(viewport.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(listeners.size).toBe(0)
    expect(document.body.style.overflow).toBe('clip')
    expect(document.body.style.position).toBe('relative')
    expect(scrollTo).toHaveBeenCalledWith(0, 321)
  })

  it('affiche un 429 anti-rafale temporaire distinct puis réactive la saisie', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted()))
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 429, headers: { 'retry-after': '0.05' } }))
    render(<EliaMessenger greeting="Bonjour" />)
    const input = await screen.findByRole('textbox', { name: /votre réponse/i })
    await user.type(input, 'Bonjour')
    await user.click(screen.getByRole('button', { name: 'Envoyer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/trop de messages rapprochés/i)
    expect(screen.getByRole('alert')).not.toHaveTextContent(/30 messages/i)
    expect(input).toBeDisabled()
    await waitFor(() => expect(input).toBeEnabled(), { timeout: 500 })
    expect(input).toHaveValue('Bonjour')
  })

  it('purge après sept minutes dans l’onglet et renouvelle le TTL sur saisie réelle', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-21T08:00:00Z'))
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({ updatedAt: Date.now() })))
    render(<EliaMessenger greeting="Bonjour" />)
    await act(() => vi.advanceTimersByTimeAsync(1))
    const input = screen.getByRole('textbox', { name: /votre réponse/i })
    await vi.advanceTimersByTimeAsync(6 * 60 * 1000)
    fireEvent.change(input, { target: { value: 'activité' } })
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000)
    expect(sessionStorage.getItem(ELIA_SESSION_KEY)).not.toBeNull()
    await act(() => vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1))
    expect(sessionStorage.getItem(ELIA_SESSION_KEY)).toBeNull()
    expect(sessionStorage.getItem(ELIA_CONSENT_KEY)).toBeNull()
    expect(screen.queryByDisplayValue('activité')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('valide et persiste la preuve de consentement renouvelée par un done réussi', async () => {
    const user = userEvent.setup()
    const renewedProof = 'renewed-proof.valid-signature'
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted()))
    vi.mocked(fetch).mockResolvedValueOnce(sseResponse([
      { type: 'delta', text: 'Réponse renouvelée.' },
      { type: 'done', collectedState: {}, quickReplies: [], readyForConfirmation: false, historyToken: 'next.payload.signature', consentProof: renewedProof },
    ]))

    render(<EliaMessenger greeting="Bonjour" />)
    await user.type(await screen.findByRole('textbox', { name: /votre réponse/i }), 'Continuer')
    await user.click(screen.getByRole('button', { name: 'Envoyer' }))
    await screen.findByText('Réponse renouvelée.')

    await waitFor(() => expect(JSON.parse(sessionStorage.getItem(ELIA_SESSION_KEY)!).consentProof).toBe(renewedProof))
  })

  it('ignore une preuve renouvelée mal formée au lieu de la persister', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted()))
    vi.mocked(fetch).mockResolvedValueOnce(sseResponse([
      { type: 'delta', text: 'Réponse conservée.' },
      { type: 'done', collectedState: {}, quickReplies: [], readyForConfirmation: false, historyToken: 'next.payload.signature', consentProof: 'preuve invalide' },
    ]))

    render(<EliaMessenger greeting="Bonjour" />)
    await user.type(await screen.findByRole('textbox', { name: /votre réponse/i }), 'Continuer')
    await user.click(screen.getByRole('button', { name: 'Envoyer' }))
    await screen.findByText('Réponse conservée.')

    await waitFor(() => {
      const stored = JSON.parse(sessionStorage.getItem(ELIA_SESSION_KEY)!)
      expect(stored.messages).toHaveLength(3)
      expect(stored.consentProof).toBe('proof.payload.signature')
    })
  })

  it('refuse un faux succès 2xx mal formé et conserve la session', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify(persisted({ isOpen: false })))
    vi.mocked(fetch)
      .mockResolvedValueOnce(sseResponse([{ type: 'done', collectedState: completeState, quickReplies: [], readyForConfirmation: true, devisToken: 'token' }]))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    render(<EliaMessenger greeting="Bonjour" />)
    await user.click(await screen.findByRole('button', { name: /ouvrir la conversation/i }))
    await user.type(screen.getByRole('textbox', { name: /votre réponse/i }), 'Terminer')
    await user.click(screen.getByRole('button', { name: 'Envoyer' }))
    await user.click(await screen.findByRole('button', { name: 'Confirmer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/n’a pas été envoyée/)
    expect(sessionStorage.getItem(ELIA_SESSION_KEY)).not.toBeNull()
  })
})

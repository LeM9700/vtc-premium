import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FloatingActionMenu from '@/components/ui/FloatingActionMenu'
import { GOOGLE_REVIEWS_FALLBACK_URI } from '@/lib/links'

describe('FloatingActionMenu', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('déplie les trois actions globales avec les bonnes destinations', async () => {
    const user = userEvent.setup()
    render(<FloatingActionMenu />)
    const trigger = screen.getByRole('button', { name: /ouvrir les actions rapides/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: /appeler vtcland/i })).not.toBeInTheDocument()

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /appeler vtcland/i })).toHaveAttribute('href', 'tel:0783699229')
    expect(screen.getByRole('link', { name: /faire une demande avec élia/i })).toHaveAttribute('href', '/?elia=open#contact')
    expect(screen.getByRole('link', { name: /laisser un avis/i })).toHaveAttribute('href', GOOGLE_REVIEWS_FALLBACK_URI)
  })

  it('se ferme avec Échap, rend le focus au logo et se ferme au clic extérieur', async () => {
    const user = userEvent.setup()
    render(<FloatingActionMenu />)
    const trigger = screen.getByRole('button', { name: /ouvrir les actions rapides/i })
    await user.click(trigger)
    expect(screen.getByRole('link', { name: /appeler vtcland/i })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    await user.click(document.body)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('maintient la navigation clavier dans le menu lorsqu’il est ouvert', async () => {
    const user = userEvent.setup()
    render(<FloatingActionMenu />)
    const trigger = screen.getByRole('button', { name: /ouvrir les actions rapides/i })
    await user.click(trigger)
    const call = screen.getByRole('link', { name: /appeler vtcland/i })
    const review = screen.getByRole('link', { name: /laisser un avis/i })

    review.focus()
    await user.tab()
    expect(trigger).toHaveFocus()
    await user.tab()
    expect(call).toHaveFocus()
  })
})

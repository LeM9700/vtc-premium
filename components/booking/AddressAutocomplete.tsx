'use client'

import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react'

interface Suggestion {
  placeId: string
  text: string
}

interface AddressAutocompleteProps {
  id: string
  label: string
  value: string
  required?: boolean
  onChange: (value: string) => void
  onSelectionChange: (selected: boolean) => void
}

export default function AddressAutocomplete({
  id,
  label,
  value,
  required = false,
  onChange,
  onSelectionChange,
}: AddressAutocompleteProps) {
  const listId = `${useId()}-suggestions`
  const rootRef = useRef<HTMLDivElement>(null)
  const sessionTokenRef = useRef<string | null>(null)
  const skipNextSearchRef = useRef(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (!sessionTokenRef.current) sessionTokenRef.current = crypto.randomUUID()
  }, [])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    const query = value.trim()
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false
      return
    }
    if (query.length < 3) return

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setLoading(true)
      setFailed(false)
      try {
        const response = await fetch('/api/places', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ input: query, sessionToken: sessionTokenRef.current }),
          signal: controller.signal,
        })
        const payload = await response.json() as { suggestions?: Suggestion[] }
        if (!response.ok) throw new Error('Places request failed')
        const nextSuggestions = payload.suggestions ?? []
        setSuggestions(nextSuggestions)
        setActiveIndex(-1)
        setOpen(nextSuggestions.length > 0)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSuggestions([])
          setOpen(true)
          setFailed(true)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 300)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [value])

  function select(suggestion: Suggestion) {
    skipNextSearchRef.current = true
    onChange(suggestion.text)
    onSelectionChange(true)
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
    sessionTokenRef.current = crypto.randomUUID()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(index => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(index => (index <= 0 ? suggestions.length - 1 : index - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      select(suggestions[activeIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        className="field"
        required={required}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        placeholder={label}
        value={value}
        onChange={event => {
          const nextValue = event.target.value
          if (nextValue.trim().length < 3) {
            setSuggestions([])
            setOpen(false)
            setFailed(false)
            setLoading(false)
          }
          onChange(nextValue)
          onSelectionChange(false)
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {loading && <span className="absolute right-3 top-3 text-xs text-white/50">Recherche…</span>}
      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden border border-[#C9A96E]/40 bg-[#111] shadow-2xl"
        >
          {failed ? (
            <p className="p-3 text-sm text-red-200">Service d’adresses indisponible. Réessayez dans un instant.</p>
          ) : (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  id={`${listId}-${index}`}
                  key={suggestion.placeId}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`block w-full border-b border-white/10 p-3 text-left text-sm last:border-0 ${index === activeIndex ? 'bg-[#C9A96E] text-black' : 'bg-[#111] text-[#F5F0E8] hover:bg-white/10'}`}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => select(suggestion)}
                >
                  {suggestion.text}
                </button>
              ))}
              <p className="px-3 py-2 text-right text-[10px] uppercase tracking-widest text-white/40">Google Maps</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

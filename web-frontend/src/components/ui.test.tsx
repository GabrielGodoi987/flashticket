import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventCard } from './ui'
import type { Event } from '../lib/api/types'

const event: Event = {
  id: 'test-event',
  title: 'Test Event',
  eyebrow: 'A good night',
  description: 'A test event.',
  category: 'Music',
  dateLabel: 'Fri, 18 Oct',
  dateISO: '2026-10-18',
  timeLabel: '20:00 — 01:00',
  location: 'Test Hall',
  city: 'São Paulo, SP',
  imageUrl: 'https://example.com/event.jpg',
  accent: '#ff6b35',
  status: 'on-sale',
  attendees: 42,
  tickets: [{ id: 'standard', name: 'Standard', description: 'Entry', price: 42, available: 10, total: 50, salesPeriod: 'Until event day' }],
}

describe('EventCard', () => {
  it('renders the event identity and starting price', () => {
    render(<EventCard event={event} />)
    expect(screen.getByRole('heading', { name: 'Test Event' })).toBeInTheDocument()
    expect(screen.getByText('From R$ 42')).toBeInTheDocument()
    expect(screen.getByText('42 going')).toBeInTheDocument()
  })
})

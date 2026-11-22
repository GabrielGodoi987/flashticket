import type {
  ApiClient,
  AppNotification,
  Event,
  EventCategory,
  IssuedTicket,
  OperationsSummary,
  OrganizerEvent,
  OrganizerMetric,
  Reservation,
} from './types'
import { ApiError } from './types'

const images = {
  skyline: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85',
  pulse: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85',
  jazz: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85',
  rooftop: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=85',
  studio: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85',
}

const events: Event[] = [
  {
    id: 'echoes-of-tomorrow',
    title: 'Echoes of Tomorrow',
    eyebrow: 'Immersive electronic night',
    description: 'A cinematic live set from the artists shaping the next wave of electronic music, surrounded by light, motion, and a room that moves as one.',
    category: 'Music',
    dateLabel: 'Fri, 18 Oct',
    dateISO: '2026-10-18',
    timeLabel: '20:00 — 01:00',
    location: 'Arca Warehouse',
    city: 'São Paulo, SP',
    imageUrl: images.studio,
    accent: '#ff6b35',
    status: 'selling-fast',
    attendees: 842,
    featured: true,
    tickets: [
      { id: 'echoes-ga', name: 'General admission', description: 'Access to the main floor and all stages.', price: 42, available: 96, total: 900, salesPeriod: 'Until 18 Oct, 18:00' },
      { id: 'echoes-vip', name: 'Afterglow pass', description: 'Fast lane, elevated deck, and welcome drink.', price: 88, available: 18, total: 120, salesPeriod: 'Until 18 Oct, 18:00' },
    ],
  },
  {
    id: 'the-city-sings',
    title: 'The City Sings',
    eyebrow: 'Open-air voices',
    description: 'A warm, sprawling night of choirs, soul, and city lights under the open sky.',
    category: 'Music',
    dateLabel: 'Sat, 26 Oct',
    dateISO: '2026-10-26',
    timeLabel: '18:30 — 23:00',
    location: 'Parque da Luz',
    city: 'São Paulo, SP',
    imageUrl: images.skyline,
    accent: '#f4b942',
    status: 'on-sale',
    attendees: 486,
    tickets: [
      { id: 'city-std', name: 'Lawn ticket', description: 'Bring a blanket and settle into the sound.', price: 28, available: 310, total: 1200, salesPeriod: 'Until 26 Oct, 16:00' },
      { id: 'city-deck', name: 'Golden hour deck', description: 'Raised viewing area and bar access.', price: 64, available: 42, total: 120, salesPeriod: 'Until 26 Oct, 16:00' },
    ],
  },
  {
    id: 'midnight-jazz-club',
    title: 'Midnight Jazz Club',
    eyebrow: 'Late set / limited seats',
    description: 'An intimate late-night session with a rotating quartet, vinyl selectors, and the best seats in the room.',
    category: 'Arts',
    dateLabel: 'Thu, 31 Oct',
    dateISO: '2026-10-31',
    timeLabel: '22:00 — 02:00',
    location: 'Blue Note Annex',
    city: 'Rio de Janeiro, RJ',
    imageUrl: images.jazz,
    accent: '#a4d4b4',
    status: 'on-sale',
    attendees: 124,
    tickets: [{ id: 'jazz-table', name: 'Club entry', description: 'Table seating allocated on arrival.', price: 36, available: 38, total: 180, salesPeriod: 'Until 31 Oct, 20:00' }],
  },
  {
    id: 'rooftop-cinema',
    title: 'Rooftop Cinema: Her',
    eyebrow: 'Films above the city',
    description: 'A sunset screening, a skyline, and a soundtrack that stays with you on the way home.',
    category: 'Arts',
    dateLabel: 'Sun, 03 Nov',
    dateISO: '2026-11-03',
    timeLabel: '19:00 — 23:30',
    location: 'Mirante 22',
    city: 'Belo Horizonte, MG',
    imageUrl: images.rooftop,
    accent: '#e98c89',
    status: 'on-sale',
    attendees: 205,
    tickets: [{ id: 'cinema-seat', name: 'Screening seat', description: 'Reserved seat with one drink token.', price: 31, available: 76, total: 260, salesPeriod: 'Until 03 Nov, 16:00' }],
  },
]

const tickets: IssuedTicket[] = [
  { id: 'ticket-echoes', eventId: 'echoes-of-tomorrow', eventTitle: 'Echoes of Tomorrow', ticketName: 'Afterglow pass', holder: 'Gabriel Godoi', dateLabel: 'Fri, 18 Oct', timeLabel: '20:00 — 01:00', location: 'Arca Warehouse · São Paulo', status: 'issued', qrValue: 'FT-ECHOES-GG-1942', imageUrl: images.studio },
  { id: 'ticket-jazz', eventId: 'midnight-jazz-club', eventTitle: 'Midnight Jazz Club', ticketName: 'Club entry', holder: 'Gabriel Godoi', dateLabel: 'Thu, 31 Oct', timeLabel: '22:00 — 02:00', location: 'Blue Note Annex · Rio de Janeiro', status: 'issued', qrValue: 'FT-JAZZ-GG-1058', imageUrl: images.jazz },
]

const notifications: AppNotification[] = [
  { id: 'note-1', category: 'reservation', title: 'Your Afterglow pass is ready', body: 'Echoes of Tomorrow is saved to My tickets. Doors open at 20:00.', timestamp: '12 min ago', read: false },
  { id: 'note-2', category: 'event', title: 'A new date just dropped', body: 'Rooftop Cinema added an encore screening for next Sunday.', timestamp: '2 h ago', read: false },
  { id: 'note-3', category: 'account', title: 'Profile details updated', body: 'Your preferred city is now São Paulo.', timestamp: 'Yesterday', read: true },
]

const organizerEvents: OrganizerEvent[] = events.map((event, index) => ({
  ...event,
  sales: [842, 486, 124, 205][index],
  revenue: [41260, 15840, 4464, 6355][index],
  capacity: [1020, 1320, 180, 260][index],
}))

const metrics: OrganizerMetric[] = [
  { label: 'Gross sales', value: 'R$ 67.9k', change: '+18.4%', tone: 'positive' },
  { label: 'Tickets issued', value: '1,657', change: '+9.2%', tone: 'positive' },
  { label: 'Active events', value: '04', change: 'This season', tone: 'accent' },
  { label: 'Avg. conversion', value: '6.8%', change: 'Gateway metric', tone: 'default' },
]

const operations: OperationsSummary = {
  reservationCount: 1284,
  confirmedCount: 1130,
  pendingCount: 96,
  grossSales: 67919,
  recent: [
    { id: 'op-1', eventTitle: 'Echoes of Tomorrow', customer: 'Marina Lopes', amount: 88, status: 'confirmed', time: '2 min ago' },
    { id: 'op-2', eventTitle: 'The City Sings', customer: 'Carlos Mendes', amount: 56, status: 'pending', time: '18 min ago' },
    { id: 'op-3', eventTitle: 'Midnight Jazz Club', customer: 'Lia Santos', amount: 36, status: 'confirmed', time: '42 min ago' },
    { id: 'op-4', eventTitle: 'Rooftop Cinema: Her', customer: 'Ana Ribeiro', amount: 31, status: 'failed', time: '1 h ago' },
  ],
}

const wait = <T,>(value: T) => new Promise<T>((resolve) => window.setTimeout(() => resolve(value), 180))

export const mockApi: ApiClient = {
  async listEvents(params) {
    const normalized = params?.query?.trim().toLowerCase()
    return wait(events.filter((event) => {
      const matchesQuery = !normalized || `${event.title} ${event.eyebrow} ${event.city}`.toLowerCase().includes(normalized)
      const matchesCategory = !params?.category || params.category === 'All' || event.category === params.category
      return matchesQuery && matchesCategory
    }))
  },
  async getEvent(eventId) {
    const event = events.find((item) => item.id === eventId)
    if (!event) throw new ApiError({ status: 404, code: 'EVENT_NOT_FOUND', message: 'This event could not be found.' })
    return wait(event)
  },
  async createReservation(input) {
    const event = events.find((item) => item.id === input.eventId)
    const ticket = event?.tickets.find((item) => item.id === input.ticketCategoryId)
    if (!event || !ticket) throw new ApiError({ status: 404, code: 'TICKET_CATEGORY_NOT_FOUND', message: 'Ticket category unavailable.' })
    const quantity = Math.min(Math.max(input.quantity, 1), 4)
    const subtotal = ticket.price * quantity
    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      ticketName: ticket.name,
      quantity,
      subtotal,
      serviceFee: Math.round(subtotal * 0.1),
      total: Math.round(subtotal * 1.1),
      status: 'pending',
      expiresAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    }
    return wait(reservation)
  },
  async getTickets() { return wait(tickets) },
  async getNotifications() { return wait(notifications) },
  async markNotificationRead(id) {
    const note = notifications.find((item) => item.id === id)
    if (note) note.read = true
    return wait(undefined)
  },
  async getOrganizerMetrics() { return wait(metrics) },
  async getOrganizerEvents() { return wait(organizerEvents) },
  async getOperationsSummary() { return wait(operations) },
}

export const mockEventCategories: Array<EventCategory | 'All'> = ['All', 'Music', 'Arts', 'Food & Drink', 'Community']

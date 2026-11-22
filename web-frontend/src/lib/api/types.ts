export type EventCategory = 'Music' | 'Arts' | 'Food & Drink' | 'Community'
export type EventStatus = 'on-sale' | 'selling-fast' | 'sold-out' | 'draft' | 'published'
export type ReservationStatus = 'pending' | 'confirmed' | 'expired' | 'failed'
export type TicketStatus = 'issued' | 'used' | 'cancelled'
export type NotificationCategory = 'reservation' | 'event' | 'account'

export interface TicketCategory {
  id: string
  name: string
  description: string
  price: number
  available: number
  total: number
  salesPeriod: string
}

export interface Event {
  id: string
  title: string
  eyebrow: string
  description: string
  category: EventCategory
  dateLabel: string
  dateISO: string
  timeLabel: string
  location: string
  city: string
  imageUrl: string
  accent: string
  status: EventStatus
  attendees: number
  featured?: boolean
  tickets: TicketCategory[]
}

export interface Reservation {
  id: string
  eventId: string
  eventTitle: string
  ticketName: string
  quantity: number
  subtotal: number
  serviceFee: number
  total: number
  status: ReservationStatus
  expiresAt: string
  createdAt: string
}

export interface IssuedTicket {
  id: string
  eventId: string
  eventTitle: string
  ticketName: string
  holder: string
  dateLabel: string
  timeLabel: string
  location: string
  status: TicketStatus
  qrValue?: string
  imageUrl: string
}

export interface AppNotification {
  id: string
  category: NotificationCategory
  title: string
  body: string
  timestamp: string
  read: boolean
}

export interface OrganizerMetric {
  label: string
  value: string
  change?: string
  tone: 'default' | 'positive' | 'accent'
}

export interface OrganizerEvent extends Event {
  sales: number
  revenue: number
  capacity: number
}

export interface OperationsSummary {
  reservationCount: number
  confirmedCount: number
  pendingCount: number
  grossSales: number
  recent: Array<{
    id: string
    eventTitle: string
    customer: string
    amount: number
    status: ReservationStatus
    time: string
  }>
}

export interface ApiErrorShape {
  status: number
  code: string
  message: string
  requestId?: string
}

export class ApiError extends Error implements ApiErrorShape {
  status: number
  code: string
  requestId?: string

  constructor({ status, code, message, requestId }: ApiErrorShape) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

export interface ApiClient {
  listEvents(params?: { query?: string; category?: EventCategory | 'All'; date?: string }): Promise<Event[]>
  getEvent(eventId: string): Promise<Event>
  createReservation(input: { eventId: string; ticketCategoryId: string; quantity: number }): Promise<Reservation>
  getTickets(): Promise<IssuedTicket[]>
  getNotifications(): Promise<AppNotification[]>
  markNotificationRead(id: string): Promise<void>
  getOrganizerMetrics(): Promise<OrganizerMetric[]>
  getOrganizerEvents(): Promise<OrganizerEvent[]>
  getOperationsSummary(): Promise<OperationsSummary>
}

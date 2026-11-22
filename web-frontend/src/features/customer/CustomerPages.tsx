import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, Clock3, CreditCard, Download, Grid2X2, Heart, MapPin, Minus, Plus, QrCode, Search, ShieldCheck, Ticket, Users, WalletCards } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, apiMode } from '../../lib/api/client'
import { formatCountdown, formatCurrency, formatLongDate } from '../../lib/format'
import { Badge, Button, CheckIcon, EmptyState, EventCard, Notice, SectionHeading, StatusBadge, TinyClock } from '../../components/ui'
import type { EventCategory } from '../../lib/api/types'
import { mockEventCategories } from '../../lib/api/mock'

const categories = [
  { label: 'All events', icon: Grid2X2 },
  { label: 'Music', icon: Ticket },
  { label: 'Arts', icon: Heart },
  { label: 'Food & Drink', icon: WalletCards },
  { label: 'Community', icon: Users },
]

export function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: events = [], isLoading } = useQuery({ queryKey: ['events', 'home'], queryFn: () => api.listEvents() })
  const featured = events.find((event) => event.featured) ?? events[0]
  const upcoming = events.filter((event) => event.id !== featured?.id)

  return <div className="page page--home">
    <section className="hero-section">
      <div className="hero-section__copy"><p className="eyebrow eyebrow--bright">Your next night starts here</p><h1>Find the <em>feeling</em><br />you’ve been missing.</h1><p className="hero-section__lede">From electric warehouse sets to slow Sunday afternoons — discover the moments worth showing up for.</p><form className="hero-search" onSubmit={(event) => { event.preventDefault(); navigate(`/events${search ? `?q=${encodeURIComponent(search)}` : ''}`) }}><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search artists, events, cities..." aria-label="Search events" /><button type="submit"><ArrowRight size={18} /></button></form><div className="hero-section__meta"><span><span className="live-dot" /> Live ticket inventory</span><span>Curated in Brazil</span></div></div>
      {featured && <Link to={`/events/${featured.id}`} className="hero-feature"><img src={featured.imageUrl} alt="" /><div className="hero-feature__wash" /><div className="hero-feature__label"><span>01 / Featured this week</span><span><ArrowRight size={15} /></span></div><div className="hero-feature__copy"><p className="eyebrow">{featured.eyebrow}</p><h2>{featured.title}</h2><p><MapPin size={13} /> {featured.location} · {featured.city}</p></div></Link>}
    </section>

    <section className="category-strip"><p className="eyebrow">Browse by mood</p><div className="category-strip__items">{categories.map(({ label, icon: Icon }) => <button key={label} className="category-chip" onClick={() => navigate(`/events${label !== 'All events' ? `?category=${encodeURIComponent(label)}` : ''}`)}><span><Icon size={15} /></span>{label}</button>)}</div></section>

    <section className="page-section"><SectionHeading eyebrow="Made for your calendar" title="Upcoming, handpicked" description="A few good reasons to leave the house." action={<Link className="text-link" to="/events">See all events <ArrowRight size={15} /></Link>} />{isLoading ? <div className="loading-grid">{[1, 2, 3].map((item) => <div className="skeleton-card" key={item} />)}</div> : <div className="event-grid event-grid--three">{upcoming.map((event) => <EventCard key={event.id} event={event} />)}</div>}</section>
    <section className="quote-banner"><div><p className="eyebrow eyebrow--bright">The FlashTicket promise</p><h2>Less scrolling.<br /><em>More living.</em></h2></div><p>Every event you see is a chance to make a small story of your own. Keep the ticket. Keep the feeling.</p></section>
  </div>
}

export function EventsPage() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') ?? ''
  const initialCategory = (params.get('category') as EventCategory | null) ?? 'All'
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<EventCategory | 'All'>(initialCategory)
  const [dateFilter, setDateFilter] = useState('All dates')
  const [sort, setSort] = useState<'soonest' | 'latest'>('soonest')
  const { data: events = [], isLoading } = useQuery({ queryKey: ['events', query, category], queryFn: () => api.listEvents({ query, category }) })
  const visibleEvents = useMemo(() => {
    const now = Date.now()
    const limit = dateFilter === 'This week' ? now + 7 * 86400000 : dateFilter === 'This month' ? now + 31 * 86400000 : Number.POSITIVE_INFINITY
    return events.filter((event) => new Date(event.dateISO).getTime() <= limit).sort((a, b) => sort === 'soonest' ? a.dateISO.localeCompare(b.dateISO) : b.dateISO.localeCompare(a.dateISO))
  }, [dateFilter, events, sort])

  const applyFilter = (nextCategory: EventCategory | 'All') => { setCategory(nextCategory); setParams({ ...(query ? { q: query } : {}), ...(nextCategory !== 'All' ? { category: nextCategory } : {}) }) }
  return <div className="page page--listing"><div className="listing-header"><div><p className="eyebrow">The full calendar</p><h1>Find your <em>next thing.</em></h1><p>Browse what’s happening, then hold the moment.</p></div><div className="listing-header__mark">{String(events.length).padStart(2, '0')}<span>events<br />available</span></div></div>
    <div className="filters"><form className="filter-search" onSubmit={(event) => { event.preventDefault(); setParams({ ...(query ? { q: query } : {}), ...(category !== 'All' ? { category } : {}) }) }}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, artists, venues..." aria-label="Search events" /></form><div className="filter-pills">{mockEventCategories.map((item) => <button key={item} onClick={() => applyFilter(item)} className={`filter-pill ${category === item ? 'filter-pill--active' : ''}`}>{item}</button>)}<select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter by date"><option>All dates</option><option>This week</option><option>This month</option></select></div></div>
    <div className="listing-results"><div className="listing-results__meta"><span>{isLoading ? 'Finding events...' : `${visibleEvents.length} events found`}</span><button className="sort-button" onClick={() => setSort((value) => value === 'soonest' ? 'latest' : 'soonest')}>{sort === 'soonest' ? 'Soonest first' : 'Latest first'} <span>⌄</span></button></div>{isLoading ? <div className="loading-grid">{[1, 2, 3, 4].map((item) => <div className="skeleton-card" key={item} />)}</div> : visibleEvents.length ? <div className="event-grid event-grid--three">{visibleEvents.map((event) => <EventCard key={event.id} event={event} />)}</div> : <EmptyState title="Nothing in this corner yet" body="Try a different search or take a look at all events." action={<Button onClick={() => { setQuery(''); applyFilter('All'); setDateFilter('All dates') }}>Clear filters</Button>} />}</div>
  </div>
}

export function EventDetailPage() {
  const { eventId = '' } = useParams()
  const navigate = useNavigate()
  const { data: event, isLoading, isError } = useQuery({ queryKey: ['event', eventId], queryFn: () => api.getEvent(eventId) })
  const [selectedTicket, setSelectedTicket] = useState('')
  const [quantity, setQuantity] = useState(1)
  useEffect(() => { if (event && !selectedTicket) setSelectedTicket(event.tickets[0]?.id ?? '') }, [event, selectedTicket])
  if (isLoading) return <div className="page page--loading"><div className="detail-skeleton" /></div>
  if (isError || !event) return <div className="page"><EmptyState title="Event not found" body="This event may have moved or is no longer available." action={<Link to="/events" className="button button--primary">Back to events</Link>} /></div>
  const ticket = event.tickets.find((item) => item.id === selectedTicket) ?? event.tickets[0]
  return <div className="page page--detail"><Link className="back-link" to="/events"><ChevronLeft size={16} /> Back to all events</Link><div className="detail-hero"><div className="detail-hero__media"><img src={event.imageUrl} alt="" /><div className="detail-hero__media-overlay" /><span className="detail-hero__number">FT / {event.id.slice(0, 3).toUpperCase()}</span></div><div className="detail-hero__copy"><div className="detail-hero__chips"><Badge tone="accent">{event.category}</Badge><StatusBadge status={event.status} /></div><p className="eyebrow">{event.eyebrow}</p><h1>{event.title}</h1><p className="detail-hero__description">{event.description}</p><div className="detail-facts"><span><CalendarDays size={16} /><strong>{event.dateLabel}</strong><small>{formatLongDate(event.dateISO)}</small></span><span><Clock3 size={16} /><strong>{event.timeLabel}</strong><small>Doors open 30 min early</small></span><span><MapPin size={16} /><strong>{event.location}</strong><small>{event.city}</small></span></div></div></div>
    <div className="detail-lower"><div className="detail-about"><p className="eyebrow">The atmosphere</p><h2>Come for the moment.<br /><em>Stay for what happens.</em></h2><p>{event.description} FlashTicket keeps the practical details close so you can focus on the part that matters: being there.</p><div className="detail-perks"><span><ShieldCheck size={17} /> Secure reservation hold</span><span><Ticket size={17} /> Digital ticket on issue</span><span><Users size={17} /> {event.attendees.toLocaleString()} already going</span></div></div><div className="ticket-picker"><div className="ticket-picker__header"><div><p className="eyebrow">Choose your ticket</p><h2>Hold your spot</h2></div><span className="ticket-picker__step">01 / 02</span></div>{event.tickets.map((item) => <button key={item.id} className={`ticket-option ${selectedTicket === item.id ? 'ticket-option--selected' : ''}`} onClick={() => setSelectedTicket(item.id)}><span className="ticket-option__radio">{selectedTicket === item.id && <span />}</span><span className="ticket-option__body"><strong>{item.name}</strong><small>{item.description}</small><em><TinyClock /> {item.salesPeriod}</em></span><strong className="ticket-option__price">{formatCurrency(item.price)}</strong></button>)}<div className="quantity-row"><span>Quantity</span><div><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><strong>{quantity}</strong><button onClick={() => setQuantity((value) => Math.min(4, value + 1))} aria-label="Increase quantity"><Plus size={15} /></button></div></div><div className="ticket-picker__total"><span>Total <small>before service fee</small></span><strong>{formatCurrency((ticket?.price ?? 0) * quantity)}</strong></div><Button size="lg" className="button--full" onClick={() => navigate(`/checkout/${event.id}?ticket=${ticket.id}&quantity=${quantity}`)}>Reserve tickets <ArrowRight size={17} /></Button><p className="microcopy"><ShieldCheck size={13} /> You’ll have 8 minutes to complete checkout.</p></div></div>
  </div>
}

export function CheckoutPage() {
  const { eventId = '' } = useParams()
  const [params] = useSearchParams()
  const { data: event, isLoading } = useQuery({ queryKey: ['event', eventId], queryFn: () => api.getEvent(eventId) })
  const [quantity, setQuantity] = useState(Number(params.get('quantity') ?? 1))
  const [reservation, setReservation] = useState<Awaited<ReturnType<typeof api.createReservation>> | null>(null)
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const mutation = useMutation({ mutationFn: () => api.createReservation({ eventId, ticketCategoryId: params.get('ticket') ?? event?.tickets[0]?.id ?? '', quantity }), onSuccess: setReservation })
  if (isLoading || !event) return <div className="page page--loading"><div className="detail-skeleton" /></div>
  const ticket = event.tickets.find((item) => item.id === params.get('ticket')) ?? event.tickets[0]
  const currentTotal = ticket.price * quantity
  return <div className="page page--checkout"><div className="checkout-header"><div><Link className="back-link" to={`/events/${event.id}`}><ChevronLeft size={16} /> Back to event</Link><p className="eyebrow">Reservation checkout</p><h1>Keep the <em>moment</em> close.</h1></div><div className="checkout-progress"><span className="checkout-progress__active">01</span><i /><span>02</span><i /><span>03</span></div></div><div className="checkout-layout"><div className="checkout-main"><div className="checkout-card"><div className="checkout-card__title"><span className="step-number">01</span><div><p className="eyebrow">Your selection</p><h2>{event.title}</h2></div></div><div className="checkout-event"><img src={event.imageUrl} alt="" /><div><strong>{event.dateLabel} · {event.timeLabel}</strong><span>{event.location} · {event.city}</span><Badge tone="neutral">{ticket.name}</Badge></div></div><div className="quantity-row quantity-row--checkout"><span>Tickets</span><div><button onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button><strong>{quantity}</strong><button onClick={() => setQuantity((value) => Math.min(4, value + 1))}><Plus size={15} /></button></div></div></div><div className="checkout-card"><div className="checkout-card__title"><span className="step-number">02</span><div><p className="eyebrow">Reservation status</p><h2>{reservation ? 'Spot held' : 'Start a reservation'}</h2></div></div>{reservation ? <><div className="reservation-status"><div className="reservation-status__icon"><Clock3 size={22} /></div><div><strong>Reserved for you</strong><p>Your hold expires in <Countdown expiresAt={reservation.expiresAt} />. The backend controls this timestamp.</p></div><StatusBadge status={reservation.status} /></div><div className="payment-sim"><div><p className="eyebrow">Simulation only</p><h3>Confirm your payment</h3><p>No real charge will be made in mock mode.</p></div><div className="payment-sim__actions"><Button variant="outline" onClick={() => setPaymentState('failed')}><CreditCard size={16} /> Simulate failure</Button><Button onClick={() => { setPaymentState('processing'); window.setTimeout(() => setPaymentState('success'), 500) }}><CheckIcon /> Confirm payment</Button></div></div>{paymentState === 'failed' && <Notice tone="warning">Payment was declined by the simulated provider. Your reservation remains visible for integration testing.</Notice>}{paymentState === 'success' && <div className="success-banner"><CheckCircle2 size={18} /><span><strong>Payment confirmed in mock mode.</strong> Ticket issuance is backend-owned; connect the gateway to complete this workflow.</span></div>}</> : <div className="reservation-start"><p>We’ll ask the API Gateway to create a reservation hold with this ticket and quantity. The UI will only display the expiration timestamp it receives.</p><Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? 'Creating hold...' : 'Create reservation hold'} <ArrowRight size={16} /></Button>{mutation.isError && <Notice tone="warning">{mutation.error.message}</Notice>}</div>}</div></div><aside className="order-summary"><p className="eyebrow">Order summary</p><h2>One night,<br /><em>well spent.</em></h2><div className="summary-line"><span>{ticket.name} × {quantity}</span><strong>{formatCurrency(currentTotal)}</strong></div><div className="summary-line summary-line--muted"><span>Service fee</span><strong>{formatCurrency(Math.round(currentTotal * 0.1))}</strong></div><div className="summary-total"><span>Total</span><strong>{formatCurrency(Math.round(currentTotal * 1.1))}</strong></div><div className="summary-foot"><ShieldCheck size={15} /><span>Secure checkout<br /><small>Prices are returned by the API.</small></span></div></aside></div></div>
}

function Countdown({ expiresAt }: { expiresAt: string }) { const [now, setNow] = useState(Date.now()); useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, []); return <strong className="countdown">{formatCountdown(expiresAt, now)}</strong> }

export function TicketsPage() {
  const [activeTicket, setActiveTicket] = useState<string | null>(null)
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ['tickets'], queryFn: api.getTickets })
  const selectedTicket = tickets.find((ticket) => ticket.id === activeTicket)
  const downloadTicket = (ticket: (typeof tickets)[number]) => {
    const blob = new Blob([`FlashTicket\n${ticket.eventTitle}\n${ticket.ticketName}\n${ticket.dateLabel}\n${ticket.qrValue ?? ''}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${ticket.eventId}-ticket.txt`
    link.click()
    URL.revokeObjectURL(url)
  }
  return <div className="page page--tickets"><div className="listing-header"><div><p className="eyebrow">Your little archive</p><h1>My <em>tickets.</em></h1><p>Keep your plans close. Your next memory is already here.</p></div><Badge tone="success">{tickets.length} active tickets</Badge></div>{isLoading ? <div className="loading-grid">{[1, 2].map((item) => <div className="skeleton-card" key={item} />)}</div> : tickets.length ? <div className="ticket-grid">{tickets.map((ticket) => <article className="issued-ticket" key={ticket.id}><div className="issued-ticket__image"><img src={ticket.imageUrl} alt="" /><div><Badge tone={ticket.status === 'issued' ? 'success' : 'neutral'}>{ticket.status}</Badge><span>{ticket.dateLabel}</span></div></div><div className="issued-ticket__body"><div><p className="eyebrow">{ticket.ticketName}</p><h2>{ticket.eventTitle}</h2><p><MapPin size={14} /> {ticket.location}</p><p><Clock3 size={14} /> {ticket.timeLabel}</p></div><div className="issued-ticket__actions"><Button variant="outline" size="sm" onClick={() => setActiveTicket(ticket.id)}><QrCode size={15} /> Show QR</Button><button className="icon-button" aria-label="Download ticket" onClick={() => downloadTicket(ticket)}><Download size={16} /></button></div></div></article>)}</div> : <EmptyState icon={<Ticket size={19} />} title="Your archive is waiting" body="Issued tickets will appear here once the backend completes a purchase." />}{selectedTicket && selectedTicket.qrValue && <div className="qr-dialog" role="dialog" aria-label={`QR code for ${selectedTicket.eventTitle}`}><div className="qr-sheet"><div className="qr-sheet__header"><div><p className="eyebrow">Digital entry</p><h2>{selectedTicket.eventTitle}</h2></div><button className="text-button" onClick={() => setActiveTicket(null)}>Close</button></div><div className="qr-grid" aria-label={`Ticket code ${selectedTicket.qrValue}`}>{Array.from({ length: 121 }, (_, index) => { const seed = selectedTicket.qrValue!.charCodeAt(index % selectedTicket.qrValue!.length); const on = index % 11 < 2 || (seed + index * 13) % 5 < 2; return <span key={index} className={on ? 'qr-cell qr-cell--on' : 'qr-cell'} /> })}</div><code>{selectedTicket.qrValue}</code><p>Preview pattern only. A scannable asset will be rendered when the backend supplies one.</p></div></div>}</div>
}

export function NotificationsPage() { const client = useQueryClient(); const { data: notifications = [], isLoading } = useQuery({ queryKey: ['notifications'], queryFn: api.getNotifications }); const readMutation = useMutation({ mutationFn: api.markNotificationRead, onSuccess: () => client.invalidateQueries({ queryKey: ['notifications'] }) }); const unread = notifications.filter((note) => !note.read).length; return <div className="page page--notifications"><div className="listing-header"><div><p className="eyebrow">Keep in the loop</p><h1>Your <em>notifications.</em></h1><p>{unread ? `${unread} updates worth a look.` : 'You’re all caught up.'}</p></div><button className="text-button" onClick={() => notifications.filter((note) => !note.read).forEach((note) => readMutation.mutate(note.id))}>Mark all as read</button></div><div className="notification-list">{isLoading ? <div className="empty-state"><p>Loading your updates...</p></div> : notifications.length ? notifications.map((note) => <article className={`notification-item ${note.read ? '' : 'notification-item--unread'}`} key={note.id}><div className={`notification-item__icon notification-item__icon--${note.category}`}><BellIcon category={note.category} /></div><div className="notification-item__copy"><div><Badge tone="neutral">{note.category}</Badge><span>{note.timestamp}</span></div><h3>{note.title}</h3><p>{note.body}</p></div>{!note.read && <button className="notification-item__read" onClick={() => readMutation.mutate(note.id)} aria-label={`Mark ${note.title} as read`}><span /></button>}</article>) : <EmptyState title="No notifications yet" body="Updates from your reservations and events will appear here." />}</div><Notice>Notifications are owned by the backend. Mock mode only demonstrates the presentation and read state.</Notice></div> }

function BellIcon({ category }: { category: string }) { return category === 'reservation' ? <CheckCircle2 size={17} /> : category === 'event' ? <CalendarDays size={17} /> : <ShieldCheck size={17} /> }

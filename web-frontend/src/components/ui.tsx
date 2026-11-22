import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import { ArrowUpRight, Check, ChevronDown, CircleAlert, Clock3, LockKeyhole, Sparkles } from 'lucide-react'
import type { Event, EventStatus, ReservationStatus } from '../lib/api/types'
import { formatCurrency } from '../lib/format'

export const Logo = ({ compact = false }: { compact?: boolean }) => (
  <div className="brand-mark" aria-label="FlashTicket">
    <span className="brand-mark__icon"><Sparkles size={15} strokeWidth={2.6} /></span>
    {!compact && <span className="brand-mark__word">Flash<span>Ticket</span></span>}
  </div>
)

export const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' | 'danger'; size?: 'sm' | 'md' | 'lg' }) => (
  <button className={`button button--${variant} button--${size} ${className}`} {...props}>{children}</button>
)

export const Badge = ({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }>) => <span className={`badge badge--${tone}`}>{children}</span>

export const EventCard = ({ event, compact = false }: { event: Event; compact?: boolean }) => (
  <article className={`event-card ${compact ? 'event-card--compact' : ''}`}>
    <a href={`/events/${event.id}`} className="event-card__image-link" aria-label={`Open ${event.title}`}>
      <img src={event.imageUrl} alt="" className="event-card__image" />
      <div className="event-card__shade" />
      <div className="event-card__topline"><Badge tone={event.status === 'selling-fast' ? 'accent' : 'neutral'}>{event.status === 'selling-fast' ? 'Selling fast' : event.category}</Badge><span className="event-card__arrow"><ArrowUpRight size={18} /></span></div>
      <div className="event-card__date"><strong>{event.dateLabel.split(' ')[1]?.replace(',', '')}</strong><span>{event.dateLabel.split(' ')[0]}</span></div>
      <div className="event-card__copy"><p className="eyebrow">{event.eyebrow}</p><h3>{event.title}</h3><p className="event-card__location">{event.location} · {event.city}</p></div>
    </a>
    {!compact && <div className="event-card__footer"><span>From {formatCurrency(Math.min(...event.tickets.map((ticket) => ticket.price)))}</span><span>{event.attendees.toLocaleString()} going</span></div>}
  </article>
)

export const StatusBadge = ({ status }: { status: EventStatus | ReservationStatus }) => {
  const labels: Record<string, string> = { 'on-sale': 'On sale', 'selling-fast': 'Selling fast', 'sold-out': 'Sold out', draft: 'Draft', published: 'Published', pending: 'Pending', confirmed: 'Confirmed', expired: 'Expired', failed: 'Failed' }
  const tone = status === 'confirmed' || status === 'published' || status === 'on-sale' ? 'success' : status === 'failed' || status === 'expired' ? 'danger' : status === 'selling-fast' ? 'accent' : 'warning'
  return <Badge tone={tone}>{labels[status] ?? status}</Badge>
}

export const SectionHeading = ({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) => (
  <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p className="section-heading__description">{description}</p>}</div>{action}</div>
)

export const EmptyState = ({ icon = <CircleAlert size={20} />, title, body, action }: { icon?: ReactNode; title: string; body: string; action?: ReactNode }) => <div className="empty-state"><div className="empty-state__icon">{icon}</div><h3>{title}</h3><p>{body}</p>{action}</div>

export const Notice = ({ children, tone = 'info' }: PropsWithChildren<{ tone?: 'info' | 'warning' }>) => <div className={`notice notice--${tone}`}><CircleAlert size={16} /> <span>{children}</span></div>

export const MetricCard = ({ label, value, change, tone = 'default' }: { label: string; value: string; change?: string; tone?: string }) => <div className={`metric-card metric-card--${tone}`}><p>{label}</p><strong>{value}</strong>{change && <span>{change}</span>}</div>

export const SelectChevron = () => <ChevronDown size={16} />
export const TinyLock = () => <LockKeyhole size={13} />
export const TinyClock = () => <Clock3 size={14} />
export const CheckIcon = () => <Check size={15} />

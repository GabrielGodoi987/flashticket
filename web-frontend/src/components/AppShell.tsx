import { Bell, Compass, LayoutDashboard, LogIn, Menu, MoreHorizontal, ReceiptText, Search, Ticket, X } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Logo } from './ui'
import { apiMode } from '../lib/api/client'

const customerNav = [
  { to: '/', label: 'Discover', icon: Compass, end: true },
  { to: '/events', label: 'Browse events', icon: Search },
  { to: '/tickets', label: 'My tickets', icon: Ticket },
  { to: '/notifications', label: 'Notifications', icon: Bell },
]

const organizerNav = [
  { to: '/organizer', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/organizer/events', label: 'Manage events', icon: ReceiptText },
  { to: '/organizer/tickets', label: 'Ticket setup', icon: Ticket },
  { to: '/organizer/operations', label: 'Operations', icon: MoreHorizontal },
]

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const organizer = location.pathname.startsWith('/organizer')
  const nav = organizer ? organizerNav : customerNav

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__top"><Logo /> <button className="icon-button sidebar__close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={19} /></button></div>
      <div className="sidebar__mode"><span className="mode-dot" /> {apiMode}<span className="mode-lock">·</span></div>
      <p className="sidebar__label">{organizer ? 'Organizer workspace' : 'Your night, your way'}</p>
      <nav className="sidebar__nav" aria-label="Primary navigation">{nav.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'Notifications' && apiMode === 'MOCK MODE' && <span className="nav-link__count">2</span>}</NavLink>)}</nav>
      <div className="sidebar__bottom">
        {!organizer ? <NavLink to="/organizer" className="switch-card"><span className="switch-card__icon"><LayoutDashboard size={16} /></span><span><strong>For organizers</strong><small>Manage your events</small></span><MoreHorizontal size={16} /></NavLink> : <NavLink to="/" className="switch-card"><span className="switch-card__icon"><Compass size={16} /></span><span><strong>Back to discovery</strong><small>See the public storefront</small></span><MoreHorizontal size={16} /></NavLink>}
        <div className="sidebar__profile"><div className="avatar">{apiMode === 'MOCK MODE' ? 'GG' : '—'}</div><div><strong>{apiMode === 'MOCK MODE' ? 'Gabriel Godoi' : 'IAM session'}</strong><small>{apiMode === 'MOCK MODE' ? 'gabriel@flashticket.co' : 'Connect existing auth'}</small></div><MoreHorizontal size={16} /></div>
      </div>
    </aside>
    <main className="main-content"><header className="mobile-header"><button className="icon-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><Logo compact /><NavLink to="/notifications" className="icon-button" aria-label="Notifications"><Bell size={18} /></NavLink></header><Outlet /></main>
  </div>
}

import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { CheckoutPage, EventDetailPage, EventsPage, HomePage, NotificationsPage, TicketsPage } from '../features/customer/CustomerPages'
import { OrganizerEventsPage, OrganizerOperationsPage, OrganizerOverviewPage, OrganizerTicketsPage } from '../features/organizer/OrganizerPages'
import { SignInPage, SignUpPage } from '../features/auth/AuthPages'
import { Notice } from '../components/ui'
import { apiMode } from '../lib/api/client'

export function App() { return <Routes><Route path="/sign-in" element={<SignInPage />} /><Route path="/sign-up" element={<SignUpPage />} /><Route element={<AppShell />}><Route path="/" element={<HomePage />} /><Route path="/events" element={<EventsPage />} /><Route path="/events/:eventId" element={<EventDetailPage />} /><Route path="/checkout/:eventId" element={<CheckoutPage />} /><Route path="/tickets" element={<TicketsPage />} /><Route path="/notifications" element={<NotificationsPage />} /><Route element={<OrganizerGuard />}><Route path="/organizer" element={<OrganizerOverviewPage />} /><Route path="/organizer/events" element={<OrganizerEventsPage />} /><Route path="/organizer/tickets" element={<OrganizerTicketsPage />} /><Route path="/organizer/operations" element={<OrganizerOperationsPage />} /></Route></Route></Routes> }

function OrganizerGuard() { return apiMode === 'MOCK MODE' ? <><div className="organizer-guard"><Notice>Organizer access is protected by IAM in production. Preview access is enabled in mock mode so the workflow can be explored.</Notice></div><Outlet /></> : <Navigate to="/sign-in" replace /> }

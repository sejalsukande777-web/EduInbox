import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Mail, Clock, Search, Paperclip,
  Radio, CalendarCheck, GraduationCap, RefreshCw,
  Bell, LogOut, Menu, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useTriggerSync, useSyncStatus, useNotifications, useMarkNotifsRead } from '../../hooks'
import { Spinner } from '../ui'

const NAV = [
  { to: '/app',             icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/emails',      icon: Mail,            label: 'Emails' },
  { to: '/app/timeline',    icon: Clock,           label: 'Timeline' },
  { to: '/app/search',      icon: Search,          label: 'Search' },
  { to: '/app/attachments', icon: Paperclip,       label: 'Attachments' },
  { to: '/app/deadlines',   icon: CalendarCheck,   label: 'Deadlines' },
  { to: '/app/sources',     icon: Radio,           label: 'Sources' },
]

export function DashboardLayout() {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)

  const { data: syncStatus } = useSyncStatus()
  const triggerSync = useTriggerSync()
  const { data: notifications } = useNotifications()
  const markRead = useMarkNotifsRead()
  const unread = (notifications ?? []).filter((n: any) => !n.is_read).length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-60 bg-white border-r border-surface-100
        flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-surface-100">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="text-white" size={16} />
          </div>
          <span className="font-display font-700 text-surface-900">EduInbox AI</span>
          <button
            className="ml-auto lg:hidden p-1 rounded hover:bg-surface-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} className="text-surface-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-100 space-y-1">
          <button
            onClick={() => triggerSync.mutate()}
            disabled={syncStatus?.status === 'running' || triggerSync.isPending}
            className="sidebar-item w-full"
          >
            {syncStatus?.status === 'running'
              ? <Spinner size="sm" />
              : <RefreshCw size={17} />
            }
            {syncStatus?.status === 'running' ? 'Syncing…' : 'Sync emails'}
          </button>

          <div className="sidebar-item cursor-default select-none">
            {user?.avatar_url
              ? <img src={user.avatar_url} className="w-6 h-6 rounded-full" alt="" />
              : <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs">
                  {user?.name?.[0] ?? user?.email?.[0] ?? '?'}
                </div>
            }
            <span className="flex-1 truncate text-xs">{user?.name ?? user?.email}</span>
            <button
              onClick={handleLogout}
              className="p-1 rounded hover:bg-surface-200 text-surface-400 hover:text-surface-700"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-surface-100 flex items-center px-5 gap-4 flex-shrink-0 relative">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-surface-600" />
          </button>

          <div className="flex-1" />

          {syncStatus?.status === 'running' && (
            <div className="flex items-center gap-2 text-xs text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200">
              <Spinner size="sm" />
              Syncing emails…
            </div>
          )}

          {syncStatus?.status === 'completed' && (
            <div className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              ✓ Sync complete
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs)
                if (!showNotifs && unread > 0) markRead.mutate()
              }}
              className="relative p-2 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <Bell size={18} className="text-surface-600" />
              {unread > 0 && !showNotifs && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-surface-200 shadow-lg z-50 p-4">
                <h3 className="font-semibold text-surface-900 text-sm mb-3">Notifications</h3>
                {!notifications?.length ? (
                  <p className="text-sm text-surface-500">No notifications yet.</p>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {(notifications as any[]).slice(0, 5).map((n: any) => (
                      <li key={n.id} className="text-sm border-b border-surface-100 pb-2">
                        <p className="font-medium text-surface-800">{n.title}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{n.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
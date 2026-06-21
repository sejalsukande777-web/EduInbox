import { BookOpen, ClipboardList, Megaphone, Calendar, Paperclip, Mail, Zap } from 'lucide-react'
import { formatDistanceToNow, format, isAfter } from 'date-fns'
import { DashboardStats, TimelineItem, Deadline } from '../../types'
import { CategoryBadge, Skeleton, EmptyState } from '../ui'

// ── Stats Cards ───────────────────────────────────────────────────────────────

export function StatsCards({ stats, loading }: { stats?: DashboardStats; loading: boolean }) {
  const cards = [
    {
      label: 'Notes',
      value: stats?.total_notes ?? 0,
      icon: <BookOpen size={18} className="text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Assignments',
      value: stats?.total_assignments ?? 0,
      icon: <ClipboardList size={18} className="text-orange-600" />,
      bg: 'bg-orange-50',
    },
    {
      label: 'Announcements',
      value: stats?.total_announcements ?? 0,
      icon: <Megaphone size={18} className="text-purple-600" />,
      bg: 'bg-purple-50',
    },
    {
      label: 'Upcoming deadlines',
      value: stats?.upcoming_deadlines ?? 0,
      icon: <Calendar size={18} className="text-red-600" />,
      bg: 'bg-red-50',
    },
    {
      label: 'Attachments',
      value: stats?.total_attachments ?? 0,
      icon: <Paperclip size={18} className="text-teal-600" />,
      bg: 'bg-teal-50',
    },
    {
      label: 'New today',
      value: stats?.new_today ?? 0,
      icon: <Zap size={18} className="text-brand-600" />,
      bg: 'bg-brand-50',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((_, i) => (
          <div key={i} className="card p-5">
            <Skeleton className="h-9 w-9 rounded-xl mb-3" />
            <Skeleton className="h-7 w-10 mb-1.5" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 stagger">
      {cards.map(({ label, value, icon, bg }) => (
        <div key={label} className="stat-card animate-slide-up">
          <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
            {icon}
          </div>
          <div className="text-2xl font-display font-700 text-surface-900 tabular-nums">{value}</div>
          <div className="text-xs text-surface-500 font-medium">{label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Recent Activity ───────────────────────────────────────────────────────────

export function RecentActivity({ items, loading }: { items?: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="card">
        <div className="p-5 border-b border-surface-100">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y divide-surface-50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-14 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="p-5 border-b border-surface-100">
        <h2 className="font-display font-600 text-surface-900 text-sm">Recent activity</h2>
      </div>
      {!items?.length ? (
        <EmptyState
          icon="📬"
          title="No activity yet"
          description="Sync your emails to see academic activity here."
        />
      ) : (
        <ul className="divide-y divide-surface-50">
          {items.map((item: any) => (
            <li key={item.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-50 transition-colors">
              <div className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={14} className="text-surface-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-800 truncate">
                  {item.title || item.subject || 'Email received'}
                </p>
                <p className="text-xs text-surface-500 truncate mt-0.5">{item.description ?? ''}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {item.category && <CategoryBadge category={item.category} size="sm" />}
                <span className="text-xs text-surface-400">
                  {item.timestamp
                    ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
                    : ''}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Deadline Widget ───────────────────────────────────────────────────────────

export function DeadlineWidget({ deadlines, loading }: { deadlines?: Deadline[]; loading: boolean }) {
  const typeColors: Record<string, string> = {
    exam:       'bg-red-50 text-red-700 border-red-200',
    assignment: 'bg-orange-50 text-orange-700 border-orange-200',
    event:      'bg-green-50 text-green-700 border-green-200',
    other:      'bg-surface-100 text-surface-600 border-surface-200',
  }

  if (loading) {
    return (
      <div className="card p-5">
        <Skeleton className="h-4 w-36 mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 mb-3">
            <Skeleton className="w-1 h-14 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const upcoming = (deadlines ?? []).slice(0, 6)

  return (
    <div className="card p-5">
      <h2 className="font-display font-600 text-surface-900 text-sm mb-4">Upcoming deadlines</h2>
      {!upcoming.length ? (
        <div className="text-center py-6">
          <p className="text-2xl mb-2" aria-hidden="true">🎉</p>
          <p className="text-sm text-surface-500">No upcoming deadlines</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((dl) => {
            const color = typeColors[dl.deadline_type ?? 'other'] ?? typeColors.other
            return (
              <li key={dl.id} className="flex items-start gap-3">
                <div className="w-1 h-full min-h-[40px] bg-brand-200 rounded-full flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">{dl.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {dl.deadline_type && (
                      <span className={`badge border text-xs ${color}`}>
                        {dl.deadline_type}
                      </span>
                    )}
                    {dl.deadline_date && (
                      <span className="text-xs text-surface-500">
                        {format(new Date(dl.deadline_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  {dl.source_name && (
                    <p className="text-xs text-surface-400 mt-0.5 truncate">{dl.source_name}</p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ── Mini chart for category distribution ─────────────────────────────────────

export function CategoryChart({ stats }: { stats?: DashboardStats }) {
  if (!stats) return null

  const data = [
    { label: 'Notes',       value: stats.total_notes,         color: '#3b82f6' },
    { label: 'Assignments', value: stats.total_assignments,   color: '#f97316' },
    { label: 'Announcements',value: stats.total_announcements,color: '#a855f7' },
    { label: 'Events',      value: stats.total_events,        color: '#22c55e' },
    { label: 'Resources',   value: stats.total_resources,     color: '#14b8a6' },
  ]

  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) return null

  let offset = 0

  return (
    <div className="card p-5">
      <h2 className="font-display font-600 text-surface-900 text-sm mb-4">Category breakdown</h2>
      {/* Bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
        {data.map(d => {
          const pct = total ? (d.value / total) * 100 : 0
          return pct > 0 ? (
            <div
              key={d.label}
              style={{ width: `${pct}%`, backgroundColor: d.color }}
              className="transition-all duration-500"
            />
          ) : null
        })}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-surface-600 flex-1 truncate">{d.label}</span>
            <span className="font-medium text-surface-800 tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

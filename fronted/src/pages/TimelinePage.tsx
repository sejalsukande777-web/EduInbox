import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Filter } from 'lucide-react'
import { useTimeline, useSources } from '../hooks'
import { CategoryBadge, EmptyState, PageHeader, Skeleton } from '../components/ui'
import { EmailCategory, CATEGORY_META } from '../types'

export function TimelinePage() {
  const [days, setDays] = useState(30)
  const [sourceId, setSourceId] = useState('')
  const [category, setCategory] = useState('')

  const { data: timeline, isLoading } = useTimeline(
    days,
    sourceId || undefined,
    category || undefined,
  )
  const { data: sources } = useSources()

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <PageHeader
        title="Timeline"
        description="Your academic activity, chronologically."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-surface-400" />
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="input py-1.5 text-xs w-auto"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 3 months</option>
          </select>
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="input py-1.5 text-xs w-auto"
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {sources?.length > 0 && (
          <select
            value={sourceId}
            onChange={e => setSourceId(e.target.value)}
            className="input py-1.5 text-xs w-auto"
          >
            <option value="">All sources</option>
            {sources.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-3" />
              <div className="space-y-2 ml-6 border-l border-surface-200 pl-6">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="card p-3">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/3 mt-1.5" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !timeline?.length ? (
        <EmptyState
          icon="📅"
          title="No activity in this period"
          description="Try extending the date range or sync your inbox."
        />
      ) : (
        <div className="space-y-8">
          {timeline.map((group: any) => (
            <div key={group.date} className="animate-fade-in">
              {/* Date label */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 bg-surface-100 text-surface-700 px-3 py-1 rounded-full text-xs font-medium">
                  <Calendar size={12} />
                  {group.date}
                </div>
                <div className="flex-1 h-px bg-surface-100" />
              </div>

              {/* Items */}
              <div className="ml-4 border-l-2 border-surface-100 pl-5 space-y-2">
                {group.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="card p-3.5 hover:shadow-md transition-all duration-150 relative"
                  >
                    {/* Dot on timeline */}
                    <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-surface-200 rounded-full" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">
                          {item.subject ?? '(No subject)'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-surface-500">{item.sender}</span>
                          {item.source_name && (
                            <>
                              <span className="text-surface-300">·</span>
                              <span className="text-xs text-surface-400">{item.source_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <CategoryBadge category={item.category as EmailCategory} size="sm" />
                        <span className="text-xs text-surface-400">
                          {item.received_at
                            ? format(new Date(item.received_at), 'h:mm a')
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

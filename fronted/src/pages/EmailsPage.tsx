import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Paperclip, ChevronRight } from 'lucide-react'
import { useEmails, useSources } from '../hooks'
import { CategoryBadge, EmptyState, SkeletonList, PageHeader } from '../components/ui'
import { useNavigate } from 'react-router-dom'
import { EmailCategory, CATEGORY_META } from '../types'

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: '', label: 'All' },
  ...Object.entries(CATEGORY_META).map(([k, v]) => ({ value: k, label: v.label })),
]

export function EmailsPage() {
  const [category, setCategory] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useEmails({ category: category || undefined, source_id: sourceId || undefined, page })
  const navigate = useNavigate()
  const { data: sources } = useSources()

  const emails = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <PageHeader title="Emails" description={`${total} academic emails organized`} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Category tabs */}
        <div className="flex gap-1 bg-surface-100 p-1 rounded-xl">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => { setCategory(c.value); setPage(1) }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                category === c.value
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Source filter */}
        {sources?.length > 0 && (
          <select
            value={sourceId}
            onChange={e => { setSourceId(e.target.value); setPage(1) }}
            className="input py-1.5 text-xs w-auto"
          >
            <option value="">All sources</option>
            {sources.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Email list */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <SkeletonList count={8} />
        ) : !emails.length ? (
          <EmptyState
            icon="📭"
            title="No emails found"
            description={category ? `No ${category} emails yet. Try syncing your inbox.` : 'Sync your inbox to see emails here.'}
          />
        ) : (
          <ul className="divide-y divide-surface-50">
            {emails.map((email: any) => (
              <li
                key={email.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-surface-50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/app/emails/${email.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${email.is_read ? 'text-surface-600' : 'font-semibold text-surface-900'}`}>
                        {email.subject ?? '(No subject)'}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5 truncate">
                        {email.sender ?? email.sender_email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <CategoryBadge category={email.category as EmailCategory} size="sm" />
                      <span className="text-xs text-surface-400">
                        {email.received_at
                          ? formatDistanceToNow(new Date(email.received_at), { addSuffix: true })
                          : ''}
                      </span>
                    </div>
                  </div>
                  {email.ai_summary && (
                    <p className="text-xs text-surface-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {email.ai_summary}
                    </p>
                  )}
                  {/* Attachment pills */}
                  {email.attachments?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Paperclip size={11} className="text-surface-400" />
                      {email.attachments.slice(0, 3).map((att: any) => (
                        <span key={att.id} className="badge bg-surface-100 text-surface-600 text-xs">
                          {att.filename}
                        </span>
                      ))}
                      {email.attachments.length > 3 && (
                        <span className="text-xs text-surface-400">+{email.attachments.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-surface-300 flex-shrink-0 mt-1 group-hover:text-surface-500 transition-colors" />
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-surface-100">
            <span className="text-xs text-surface-500">
              Page {page} · {total} total
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page * 20 >= total}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

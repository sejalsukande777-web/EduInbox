import { useState, useRef } from 'react'
import { Search, Paperclip, Clock, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useSearch } from '../hooks'
import { CategoryBadge, EmptyState, PageHeader } from '../components/ui'
import { EmailCategory, CATEGORY_META } from '../types'

const SUGGESTIONS = [
  'Show all notes',
  'Find assignments due this week',
  'Show announcements from last month',
  'Find exam notices',
  'Resources uploaded recently',
]

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const search = useSearch()

  const handleSearch = (q = query) => {
    if (!q.trim()) return
    setQuery(q)
    setSubmitted(true)
    search.mutate({
      query: q,
      category: (category as EmailCategory) || undefined,
      limit: 20,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const results = search.data?.results ?? []
  const total = search.data?.total ?? 0

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <PageHeader title="Search" description="Search across all your academic emails and attachments." />

      {/* Search bar */}
      <div className="card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Try "show DBMS notes" or "find assignment deadline"'
              className="input pl-9"
              autoFocus
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="input w-36 py-2.5"
          >
            <option value="">All types</option>
            {Object.entries(CATEGORY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || search.isPending}
            className="btn-primary px-5"
          >
            {search.isPending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </button>
        </div>

        {/* Suggestions */}
        {!submitted && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-full text-surface-600 hover:bg-surface-100 hover:border-surface-300 transition-all"
              >
                <Clock size={11} />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {submitted && (
        <>
          {search.isPending ? (
            <div className="text-center py-12">
              <Loader2 size={24} className="animate-spin text-brand-500 mx-auto mb-3" />
              <p className="text-sm text-surface-500">Searching…</p>
            </div>
          ) : !results.length ? (
            <EmptyState
              icon="🔍"
              title="No results found"
              description={`No emails match "${query}". Try different keywords.`}
            />
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-surface-500">
                {total} result{total !== 1 ? 's' : ''} for <span className="font-medium text-surface-700">"{query}"</span>
              </p>
              {results.map((r: any) => (
                <div key={r.email_id} className="card p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 text-sm truncate">
                        {r.subject ?? '(No subject)'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-surface-500">{r.sender}</span>
                        {r.source_name && (
                          <>
                            <span className="text-surface-300">·</span>
                            <span className="text-xs text-surface-400">{r.source_name}</span>
                          </>
                        )}
                      </div>
                      {r.snippet && (
                        <p className="text-xs text-surface-500 mt-2 leading-relaxed line-clamp-2">
                          {r.snippet}
                        </p>
                      )}
                      {r.matched_attachments?.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Paperclip size={11} className="text-surface-400" />
                          {r.matched_attachments.slice(0, 3).map((att: any) => (
                            <span key={att.id} className="badge bg-surface-100 text-surface-600 text-xs">
                              {att.filename}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <CategoryBadge category={r.category as EmailCategory} size="sm" />
                      <span className="text-xs text-surface-400">
                        {r.received_at
                          ? formatDistanceToNow(new Date(r.received_at), { addSuffix: true })
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

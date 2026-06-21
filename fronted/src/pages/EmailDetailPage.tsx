import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Paperclip, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { useEmail } from '../hooks'
import { CategoryBadge, Skeleton } from '../components/ui'
import { EmailCategory } from '../types'

export function EmailDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: email, isLoading } = useEmail(id || '')

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!email) {
    return <div className="text-center py-20 text-surface-500">Email not found.</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to emails
      </button>

      <div className="card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-display font-700 text-surface-900">
            {email.subject || '(No subject)'}
          </h1>
          <CategoryBadge category={email.category as EmailCategory} />
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-surface-500 border-b border-surface-100 pb-4">
          <div className="flex items-center gap-1.5">
            <User size={14} />
            <span>{email.sender || email.sender_email}</span>
          </div>
          {email.received_at && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{format(new Date(email.received_at), 'MMM d, yyyy · h:mm a')}</span>
            </div>
          )}
        </div>

        {email.ai_summary && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
            <p className="text-xs font-medium text-brand-700 mb-1">✨ AI Summary</p>
            <p className="text-sm text-brand-900">{email.ai_summary}</p>
          </div>
        )}

        {email.detected_deadlines && email.detected_deadlines.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-xs font-medium text-orange-700 mb-2">Detected deadlines</p>
            {email.detected_deadlines.map((dl: any, i: number) => (
              <p key={i} className="text-sm text-orange-900">
                {dl.title} — {dl.date_text}
              </p>
            ))}
          </div>
        )}

        <div className="text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">
          {email.body_text || email.snippet || '(No content)'}
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <div className="border-t border-surface-100 pt-4">
            <p className="text-xs font-medium text-surface-500 mb-2 flex items-center gap-1.5">
              <Paperclip size={12} />
              {email.attachments.length} attachment(s)
            </p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((att: any) => (
                <a
                  key={att.id}
                  href={att.storage_url || '#'}
                  className="flex items-center gap-2 px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  <Paperclip size={11} />
                  {att.filename}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { FileText, Presentation, File, Image, Download, CalendarCheck, Check } from 'lucide-react'
import { useAttachments, useSources, useAddCustomSource, useDeadlines } from '../hooks'
import { EmptyState, PageHeader, Skeleton, SkeletonList } from '../components/ui'
import { SourceCard, AddCustomSourceForm } from '../components/sources'

// ── Attachments ───────────────────────────────────────────────────────────────

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf:   <FileText size={18} className="text-red-500" />,
  pptx:  <Presentation size={18} className="text-orange-500" />,
  ppt:   <Presentation size={18} className="text-orange-500" />,
  docx:  <FileText size={18} className="text-blue-500" />,
  doc:   <FileText size={18} className="text-blue-500" />,
  image: <Image size={18} className="text-purple-500" />,
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function AttachmentsPage() {
  const [fileType, setFileType] = useState('')
  const { data: attachments, isLoading } = useAttachments({ file_type: fileType || undefined })

  const FILTERS = [
    { value: '', label: 'All files' },
    { value: 'pdf', label: 'PDFs' },
    { value: 'pptx', label: 'Presentations' },
    { value: 'docx', label: 'Documents' },
    { value: 'image', label: 'Images' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <PageHeader
        title="Attachments"
        description={`${attachments?.length ?? 0} files saved from your academic emails.`}
      />

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFileType(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              fileType === f.value
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* File grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-3 w-3/4 mb-1.5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : !attachments?.length ? (
        <EmptyState
          icon="📎"
          title="No attachments yet"
          description="Sync your inbox — attached PDFs, slides, and documents will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {attachments.map((att: any) => (
            <div key={att.id} className="card-hover p-4 animate-slide-up">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-surface-50 border border-surface-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  {FILE_ICONS[att.file_type ?? ''] ?? <File size={18} className="text-surface-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{att.filename}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {att.file_type && (
                      <span className="text-xs text-surface-400 uppercase font-mono">{att.file_type}</span>
                    )}
                    {att.size_bytes && (
                      <>
                        <span className="text-surface-300">·</span>
                        <span className="text-xs text-surface-400">{formatBytes(att.size_bytes)}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-surface-400 mt-1">
                    {att.created_at
                      ? formatDistanceToNow(new Date(att.created_at), { addSuffix: true })
                      : ''}
                  </p>
                </div>
              </div>
              {att.storage_url && (
                <a
                  href={att.storage_url}
                  download={att.filename}
                  className="mt-3 flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium"
                  onClick={e => e.stopPropagation()}
                >
                  <Download size={12} />
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sources ───────────────────────────────────────────────────────────────────

export function SourcesPage() {
  const { data: sources, isLoading } = useSources()
  const addCustom = useAddCustomSource()

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <PageHeader
        title="Learning sources"
        description="Manage which senders EduInbox monitors for academic content."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4">
              <div className="flex gap-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !sources?.length ? (
        <EmptyState
          icon="🔍"
          title="No sources yet"
          description="Add learning sources to start monitoring academic emails."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">
          {sources.map((s: any) => (
            <SourceCard key={s.id} source={s} />
          ))}
        </div>
      )}

      <AddCustomSourceForm
        onAdd={(name, patterns) =>
          addCustom.mutate({ name, sender_patterns: patterns })
        }
      />
    </div>
  )
}

// ── Deadlines ─────────────────────────────────────────────────────────────────

export function DeadlinesPage() {
  const { data: deadlines, isLoading } = useDeadlines()

  const typeColor: Record<string, string> = {
    exam:       'bg-red-50 text-red-700 border-red-200',
    assignment: 'bg-orange-50 text-orange-700 border-orange-200',
    event:      'bg-green-50 text-green-700 border-green-200',
    other:      'bg-surface-100 text-surface-600 border-surface-200',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <PageHeader
        title="Deadlines"
        description="Exams, assignments, and events extracted from your emails."
      />

      {isLoading ? (
        <div className="card divide-y divide-surface-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : !deadlines?.length ? (
        <EmptyState
          icon="✅"
          title="No deadlines detected"
          description="EduInbox will automatically extract exam dates and submission deadlines from your emails."
        />
      ) : (
        <div className="card divide-y divide-surface-50">
          {deadlines.map((dl: any) => (
            <div
              key={dl.id}
              className={`flex items-start gap-4 px-5 py-4 transition-opacity ${dl.is_completed ? 'opacity-50' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                typeColor[dl.deadline_type ?? 'other'] ?? typeColor.other
              }`}>
                <CalendarCheck size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 text-sm">{dl.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {dl.deadline_type && (
                    <span className={`badge border text-xs ${typeColor[dl.deadline_type] ?? typeColor.other}`}>
                      {dl.deadline_type}
                    </span>
                  )}
                  {dl.deadline_date && (
                    <span className="text-xs text-surface-600 font-medium">
                      {format(new Date(dl.deadline_date), 'EEEE, MMM d yyyy')}
                    </span>
                  )}
                  {dl.source_name && (
                    <span className="text-xs text-surface-400">{dl.source_name}</span>
                  )}
                </div>
              </div>
              {dl.is_completed && (
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="text-green-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

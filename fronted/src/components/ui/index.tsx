import { EmailCategory, CATEGORY_META } from '../../types'

// ── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  category: EmailCategory
  size?: 'sm' | 'md'
}

export function CategoryBadge({ category, size = 'md' }: BadgeProps) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other
  return (
    <span className={`badge badge-${category} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}>
      <span aria-hidden="true">{meta.icon}</span>
      {meta.label}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-surface-100">
      {Array.from({ length: count }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-4xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="font-display font-600 text-surface-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-surface-500 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  accent: string
  sub?: string
}

export function StatCard({ label, value, icon, accent, sub }: StatCardProps) {
  return (
    <div className="stat-card animate-slide-up">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-display font-700 text-surface-900">{value}</div>
      <div className="text-xs text-surface-500 font-medium">{label}</div>
      {sub && <div className="text-xs text-surface-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Loading Spinner ───────────────────────────────────────────────────────────

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'
  return (
    <svg className={`${s} animate-spin text-brand-500`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Page Header ───────────────────────────────────────────────────────────────

export function PageHeader({ title, description, action }: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-700 text-surface-900">{title}</h1>
        {description && <p className="text-sm text-surface-500 mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

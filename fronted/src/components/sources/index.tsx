import { useState } from 'react'
import { Building2, Mail, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { DiscoveredSource, LearningSource } from '../../types'
import { useDeleteSource, useUpdateSource } from '../../hooks'

export function SourceCard({ source }: { source: LearningSource }) {
  const update = useUpdateSource()
  const remove = useDeleteSource()

  return (
    <div className={`rounded-2xl border p-4 transition-opacity ${!source.is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-surface-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 size={16} className="text-surface-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-surface-900 text-sm truncate">{source.name}</h3>
            {source.is_custom && (
              <span className="text-xs rounded-full bg-surface-100 px-2 py-0.5 text-surface-600">custom</span>
            )}
          </div>
          <p className="text-xs text-surface-400 mt-0.5">
            {source.email_count} emails · {source.sender_patterns.length} sender{source.sender_patterns.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {source.sender_patterns.slice(0, 3).map(p => (
              <span key={p} className="inline-flex items-center gap-1 text-xs bg-surface-50 border border-surface-200 px-2 py-0.5 rounded-full text-surface-600">
                <Mail size={10} />
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => update.mutate({ id: source.id, body: { is_active: !source.is_active } })}
            className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
            title={source.is_active ? 'Disable source' : 'Enable source'}
          >
            {source.is_active ? <ToggleRight size={18} className="text-brand-500" /> : <ToggleLeft size={18} className="text-surface-400" />}
          </button>
          <button
            onClick={() => {
              if (confirm(`Remove "${source.name}"?`)) remove.mutate(source.id)
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors"
            title="Remove source"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function DiscoverCard({
  source,
  selected,
  onToggle,
}: {
  source: DiscoveredSource
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`text-left rounded-2xl border p-4 transition-all ${
        selected ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-surface-900">{source.name}</p>
          <p className="text-xs text-surface-500 mt-1">
            {source.sender_patterns.join(', ')}
          </p>
        </div>
        <span className={`text-xs rounded-full px-2 py-1 ${selected ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600'}`}>
          {selected ? 'Selected' : 'Select'}
        </span>
      </div>
    </button>
  )
}

export function AddCustomSourceForm({
  onAdd,
}: {
  onAdd: (name: string, patterns: string[]) => void
}) {
  const [name, setName] = useState('')
  const [patterns, setPatterns] = useState('')

  const handleSubmit = () => {
    const cleanName = name.trim()
    const cleanPatterns = patterns
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)

    if (!cleanName || cleanPatterns.length === 0) return
    onAdd(cleanName, cleanPatterns)
    setName('')
    setPatterns('')
  }

  return (
    <div className="rounded-2xl border border-dashed border-surface-300 p-4">
      <p className="text-sm font-medium text-surface-800 mb-3">Add custom source</p>
      <div className="space-y-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Source name"
          className="input"
        />
        <input
          value={patterns}
          onChange={e => setPatterns(e.target.value)}
          placeholder="sender1@example.com, sender2@example.com"
          className="input"
        />
      </div>
      <button onClick={handleSubmit} className="btn-secondary mt-3 text-xs">
        Add source
      </button>
    </div>
  )
}

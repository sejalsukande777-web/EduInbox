import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { useDiscoverSources, useSelectSources } from '../hooks'
import { DiscoveredSource } from '../types'
import { DiscoverCard, AddCustomSourceForm } from '../components/sources'
import { Skeleton } from '../components/ui'

export function DiscoverSources() {
  const navigate = useNavigate()
  const { data: discovered, isLoading } = useDiscoverSources()
  const selectSources = useSelectSources()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [custom, setCustom] = useState<Array<{ name: string; sender_patterns: string[] }>>([])

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const handleSelectAll = () => {
    if (!discovered) return
    setSelected(new Set(discovered.map((s: DiscoveredSource) => s.name)))
  }

  const handleContinue = async () => {
    const sources = (discovered ?? []).filter((s: DiscoveredSource) => selected.has(s.name))
    await selectSources.mutateAsync({ sources, custom_sources: custom })
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4">
      <div className="max-w-2xl mx-auto animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-display font-700 text-surface-900 mb-2">
            We found your learning sources
          </h1>
          <p className="text-surface-500 text-sm max-w-md mx-auto">
            These senders appeared frequently in your inbox. Select the ones you want EduInbox to monitor.
            You can change this anytime.
          </p>
        </div>

        {/* Source grid */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-surface-700">
              {isLoading ? 'Scanning inbox…' : `${discovered?.length ?? 0} sources detected`}
            </span>
            {!isLoading && discovered?.length > 0 && (
              <button onClick={handleSelectAll} className="text-xs text-brand-600 font-medium hover:underline">
                Select all
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : discovered?.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-surface-500 text-sm">No sources found in the last 30 days.</p>
              <p className="text-surface-400 text-xs mt-1">Add sources manually below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
              {discovered?.map((s: DiscoveredSource) => (
                <DiscoverCard
                  key={s.name}
                  source={s}
                  selected={selected.has(s.name)}
                  onToggle={() => toggle(s.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Custom sources */}
        <div className="mb-6 space-y-3">
          {custom.map((cs, i) => (
            <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
              <span className="text-sm font-medium text-green-800 flex-1">{cs.name}</span>
              <button
                onClick={() => setCustom(prev => prev.filter((_, j) => j !== i))}
                className="text-green-600 hover:text-green-800 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
          <AddCustomSourceForm
            onAdd={(name, patterns) => setCustom(prev => [...prev, { name, sender_patterns: patterns }])}
          />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-surface-400">
            {selected.size + custom.length} source{selected.size + custom.length !== 1 ? 's' : ''} selected
          </p>
          <button
            onClick={handleContinue}
            disabled={selected.size + custom.length === 0 || selectSources.isPending}
            className="btn-primary"
          >
            {selectSources.isPending
              ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
              : <>Continue to dashboard <ArrowRight size={16} /></>
            }
          </button>
        </div>

        <p className="text-center text-xs text-surface-400 mt-4">
          You can always add or remove sources later from Settings.
        </p>
      </div>
    </div>
  )
}

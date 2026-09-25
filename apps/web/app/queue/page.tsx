'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchRecentEvents, type EventItem, type EventStatus } from '#lib/api'
import { EventTable } from '#components/event-table'
import { Button } from '#components/ui/button'

const statuses: { label: string; value: EventStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Queued', value: 'QUEUED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Dead Letter', value: 'DEAD_LETTER' },
]

export default function QueuePage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [filter, setFilter] = useState<EventStatus | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const all = await fetchRecentEvents()
    setEvents(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
    const iv = setInterval(() => { void load() }, 8000)
    return () => clearInterval(iv)
  }, [load])

  const filtered = filter === 'ALL' ? events : events.filter((e) => e.status === filter)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Queue</h1>
          <p className="text-xs text-muted-foreground">Live event pipeline. Auto-refreshes every 8s.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { void load() }} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded border px-2.5 py-1 text-xs transition-colors ${
              filter === value
                ? 'border-foreground/40 bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <EventTable events={filtered} />
    </div>
  )
}

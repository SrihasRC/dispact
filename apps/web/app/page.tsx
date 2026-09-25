'use client'

import { useState, useEffect, useCallback } from 'react'
import { StatCard } from '#components/stat-card'
import { EventTable } from '#components/event-table'
import { SendEventForm } from '#components/send-event-form'
import { SimulatorForm } from '#components/simulator-form'
import { fetchHealth, fetchRecentEvents, type EventItem, type HealthResponse } from '#lib/api'

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [h, e] = await Promise.all([fetchHealth(), fetchRecentEvents()])
    setHealth(h)
    setEvents(e)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const interval = setInterval(() => { void refresh() }, 10000)
    return () => clearInterval(interval)
  }, [refresh])

  const totalEvents = events.length
  const queuedEvents = events.filter((e) => e.status === 'QUEUED').length
  const deliveredEvents = events.filter((e) => e.status === 'DELIVERED').length
  const failedEvents = events.filter((e) => e.status === 'FAILED' || e.status === 'DEAD_LETTER').length

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live event pipeline overview. Auto-refreshes every 10s.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`inline-block size-1.5 rounded-full ${health ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
          <span className="font-mono">{health ? `API Online · ${health.uptime.toFixed(1)}s` : 'API Offline'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={loading ? '—' : totalEvents} description="Ingested across all pipelines" />
        <StatCard title="Queued" value={loading ? '—' : queuedEvents} description="Buffered in Redis intake queue" />
        <StatCard title="Delivered" value={loading ? '—' : deliveredEvents} description="Dispatched to connectors" />
        <StatCard title="Failed / DLQ" value={loading ? '—' : failedEvents} description="Moved to dead-letter queue" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Recent Events</h2>
            <p className="text-xs text-muted-foreground">Last 50 events ingested by the gateway.</p>
          </div>
          <div className="flex items-center gap-2">
            <SendEventForm onEventSent={() => { void refresh() }} />
            <SimulatorForm onSimulateSuccess={() => { void refresh() }} />
          </div>
        </div>
        <EventTable events={events} />
      </div>
    </div>
  )
}

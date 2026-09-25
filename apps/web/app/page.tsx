import { StatCard } from '#components/stat-card'
import { EventTable } from '#components/event-table'
import { SendEventForm } from '#components/send-event-form'
import { SimulatorForm } from '#components/simulator-form'
import { fetchHealth, fetchRecentEvents } from '#lib/api'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [health, events] = await Promise.all([
    fetchHealth(),
    fetchRecentEvents(),
  ])

  const totalEvents = events.length
  const queuedEvents = events.filter((e) => e.status === 'QUEUED').length
  const deliveredEvents = events.filter((e) => e.status === 'DELIVERED').length
  const failedEvents = events.filter(
    (e) => e.status === 'FAILED' || e.status === 'DEAD_LETTER'
  ).length

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            System Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Asynchronous event ingestion gateway with distributed Redis idempotency and BullMQ buffering.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`inline-block size-1.5 rounded-full ${health ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
          <span className="font-mono">
            {health ? `API Online · ${health.uptime.toFixed(1)}s` : 'API Offline'}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={totalEvents}
          description="Total events ingested across pipelines (defaulted to 0)"
        />
        <StatCard
          title="Queued"
          value={queuedEvents}
          description="Buffered in Redis event-intake queue"
        />
        <StatCard
          title="Delivered"
          value={deliveredEvents}
          description="Dispatched to outbound connectors"
        />
        <StatCard
          title="Failed"
          value={failedEvents}
          description="Moved to Dead-Letter Queue (DLQ)"
        />
      </div>

      {/* Event Feed Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Recent Event Feed
            </h2>
            <p className="text-xs text-muted-foreground">
              Audit log of events ingested by the gateway and queued for delivery.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <SendEventForm />
            <SimulatorForm />
          </div>
        </div>

        {/* Event Table or Empty State */}
        <EventTable events={events} />
      </div>
    </div>
  )
}

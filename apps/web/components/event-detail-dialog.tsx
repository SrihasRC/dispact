'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '#components/ui/dialog'
import { StatusBadge } from '#components/status-badge'
import { fetchEventDetail, type EventDetail, type EventItem } from '#lib/api'

interface EventDetailDialogProps {
  event: EventItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailDialog({ event, open, onOpenChange }: EventDetailDialogProps) {
  const [detail, setDetail] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!event.id) {
      setError('No event ID available (older record without id field)')
      return
    }
    setLoading(true)
    setError(null)
    const data = await fetchEventDetail(event.id)
    if (!data) {
      setError('Failed to load event details.')
    } else {
      setDetail(data)
    }
    setLoading(false)
  }, [event.id])

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (nextOpen && !detail) {
      void load()
    }
    if (!nextOpen) {
      setDetail(null)
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Event Detail</DialogTitle>
          <DialogDescription className="font-mono text-xs truncate">
            {event.idempotencyKey}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            Loading...
          </div>
        )}

        {error && (
          <p className="text-xs font-medium text-destructive py-4">{error}</p>
        )}

        {detail && !loading && (
          <div className="space-y-5 text-xs">
            {/* Core fields */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Event</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded border border-border bg-muted/30 p-3">
                <Field label="ID" value={detail.id} mono />
                <Field label="Status" value={<StatusBadge status={detail.status} />} />
                <Field label="Type" value={detail.eventType} mono />
                <Field label="Source" value={detail.source} />
                <Field label="Created" value={new Date(detail.createdAt).toLocaleString()} />
                <Field label="Updated" value={new Date(detail.updatedAt).toLocaleString()} />
              </div>
            </section>

            {/* Payload */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Payload</h3>
              <pre className="overflow-x-auto rounded border border-border bg-muted/30 p-3 text-[11px] font-mono leading-relaxed text-muted-foreground">
                {JSON.stringify(detail.payload, null, 2)}
              </pre>
            </section>

            {/* Delivery Logs */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Delivery Logs ({detail.deliveryLogs.length})
              </h3>
              {detail.deliveryLogs.length === 0 ? (
                <p className="text-muted-foreground italic">No delivery attempts recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail.deliveryLogs.map((log, i) => (
                    <div key={log.id} className="rounded border border-border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-foreground">
                          #{i + 1} — {log.connector}
                        </span>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          {log.statusCode !== null && (
                            <span className={`font-mono font-medium ${log.statusCode >= 200 && log.statusCode < 300 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                              HTTP {log.statusCode}
                            </span>
                          )}
                          <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      {log.response !== null && log.response !== undefined && (
                        <pre className="overflow-x-auto rounded border border-border/50 bg-background p-2 text-[10px] font-mono leading-relaxed text-muted-foreground">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className={`text-xs text-foreground ${mono ? 'font-mono truncate' : ''}`}>{value}</div>
    </div>
  )
}

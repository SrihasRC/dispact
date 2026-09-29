'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#components/ui/table'
import { StatusBadge } from '#components/status-badge'
import { EventDetailDialog } from '#components/event-detail-dialog'
import type { EventItem } from '#lib/api'

interface EventTableProps {
  events: EventItem[]
}

export function EventTable({ events }: EventTableProps) {
  const [selected, setSelected] = useState<EventItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleRowClick = (event: EventItem) => {
    setSelected(event)
    setDialogOpen(true)
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <div className="max-w-md space-y-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            No events recorded yet
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The Event Engine gateway accepts events asynchronously via HTTP POST.
            Dispatch a test event using the form above or trigger a burst simulation
            to populate the feed in real time.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-card shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-[35%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Idempotency Key
              </TableHead>
              <TableHead className="w-[25%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Event Type
              </TableHead>
              <TableHead className="w-[20%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Source
              </TableHead>
              <TableHead className="w-[10%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-[10%] text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Created At
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow
                key={event.idempotencyKey}
                className="border-border/40 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => handleRowClick(event)}
              >
                <TableCell className="font-mono text-xs font-medium text-foreground">
                  <span title={event.idempotencyKey} className="truncate max-w-[280px] inline-block">
                    {event.idempotencyKey}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-medium text-foreground">
                  {event.eventType}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {event.source}
                </TableCell>
                <TableCell>
                  <StatusBadge status={event.status} />
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatTimestamp(event.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <EventDetailDialog
          event={selected}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setSelected(null)
          }}
        />
      )}
    </>
  )
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      return timestamp
    }
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return timestamp
  }
}

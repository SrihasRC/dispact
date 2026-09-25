import { Badge } from '#components/ui/badge'
import type { EventStatus } from '#lib/api'

interface StatusBadgeProps {
  status: EventStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'DELIVERED':
      return (
        <Badge variant="default" className="font-mono text-xs uppercase">
          DELIVERED
        </Badge>
      )
    case 'PROCESSING':
      return (
        <Badge variant="secondary" className="font-mono text-xs uppercase">
          PROCESSING
        </Badge>
      )
    case 'QUEUED':
      return (
        <Badge
          variant="outline"
          className="border-transparent bg-muted font-mono text-xs text-muted-foreground uppercase"
        >
          QUEUED
        </Badge>
      )
    case 'FAILED':
      return (
        <Badge variant="destructive" className="font-mono text-xs uppercase">
          FAILED
        </Badge>
      )
    case 'DEAD_LETTER':
      return (
        <Badge variant="destructive" className="font-mono text-xs uppercase">
          DEAD_LETTER
        </Badge>
      )
    default: {
      const exhaustiveCheck: never = status
      return <Badge variant="outline">{exhaustiveCheck}</Badge>
    }
  }
}

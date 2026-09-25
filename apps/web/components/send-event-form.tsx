'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#components/ui/dialog'
import { Button } from '#components/ui/button'
import { Input } from '#components/ui/input'
import { Textarea } from '#components/ui/textarea'
import { sendEvent, type EventItem } from '#lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface SendEventFormProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  onEventSent?: (event: EventItem) => void
}

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    orderId: 'ord-88392',
    userId: 'usr-1042',
    amount: 149.99,
    currency: 'USD',
  },
  null,
  2
)

export function SendEventForm({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  onEventSent,
}: SendEventFormProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

  const [idempotencyKey, setIdempotencyKey] = useState<string>('')
  const [source, setSource] = useState<string>('checkout-service')
  const [eventType, setEventType] = useState<string>('order.created')
  const [payloadText, setPayloadText] = useState<string>(DEFAULT_PAYLOAD)
  const [payloadError, setPayloadError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Auto-generate UUID when dialog opens
  useEffect(() => {
    if (open && !idempotencyKey) {
      regenerateKey()
    }
  }, [open, idempotencyKey])

  const regenerateKey = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      setIdempotencyKey(crypto.randomUUID())
    } else {
      setIdempotencyKey(`evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
    }
  }

  const validateJson = (text: string): Record<string, unknown> | null => {
    try {
      const parsed: unknown = JSON.parse(text)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setPayloadError('Payload must be a valid JSON object.')
        return null
      }
      setPayloadError(null)
      return parsed as Record<string, unknown>
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON format'
      setPayloadError(message)
      return null
    }
  }

  const handlePayloadChange = (text: string) => {
    setPayloadText(text)
    if (payloadError) {
      validateJson(text)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const cleanKey = idempotencyKey.trim()
    if (cleanKey.length < 8 || cleanKey.length > 128) {
      toast.error('Validation Error', {
        description: 'Idempotency key must be between 8 and 128 characters.',
      })
      return
    }

    if (!source.trim()) {
      toast.error('Validation Error', {
        description: 'Source identifier is required.',
      })
      return
    }

    if (!eventType.trim()) {
      toast.error('Validation Error', {
        description: 'Event type is required.',
      })
      return
    }

    const parsedPayload = validateJson(payloadText)
    if (!parsedPayload) {
      toast.error('Validation Error', {
        description: 'Please fix JSON syntax errors before submitting.',
      })
      return
    }

    setLoading(true)

    const result = await sendEvent({
      idempotencyKey: cleanKey,
      source: source.trim(),
      eventType: eventType.trim(),
      payload: parsedPayload,
    })

    setLoading(false)

    if (result.success && result.data) {
      toast.success('Event Queued (202 Accepted)', {
        description: `Event ID: ${result.data.eventId}`,
      })

      const newEvent: EventItem = {
        idempotencyKey: cleanKey,
        source: source.trim(),
        eventType: eventType.trim(),
        status: 'QUEUED',
        createdAt: result.data.at || new Date().toISOString(),
        payload: parsedPayload,
      }

      onEventSent?.(newEvent)
      regenerateKey()
      setOpen(false)
    } else if (result.status === 409 && result.duplicate) {
      toast.warning('Duplicate Event (409 Conflict)', {
        description: `Idempotency lock detected duplicate: ${result.duplicate.eventId}`,
      })
    } else {
      toast.error('Event Ingestion Failed', {
        description: result.error || 'Failed to submit event to API gateway.',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button variant="outline">Send Test Event</Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Send Test Event</DialogTitle>
            <DialogDescription>
              Submit an event to the Fastify ingestion gateway with atomic Redis
              idempotency locking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="event-idempotency-key"
                  className="text-xs font-medium text-foreground"
                >
                  x-idempotency-key
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={regenerateKey}
                  disabled={loading}
                  className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Regenerate
                </Button>
              </div>
              <Input
                id="event-idempotency-key"
                type="text"
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                placeholder="Unique key (8–128 chars)"
                required
                disabled={loading}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Prevents double writes across distributed calls (8-128 characters).
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="event-source"
                className="text-xs font-medium text-foreground"
              >
                Source Identifier
              </label>
              <Input
                id="event-source"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. checkout-service"
                required
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">
                Origin service or producer name.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="event-type"
                className="text-xs font-medium text-foreground"
              >
                Event Type
              </label>
              <Input
                id="event-type"
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="e.g. order.created"
                required
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">
                Categorical event name (used for consumer routing).
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="event-payload"
                className="text-xs font-medium text-foreground"
              >
                Payload (JSON)
              </label>
              <Textarea
                id="event-payload"
                value={payloadText}
                onChange={(e) => handlePayloadChange(e.target.value)}
                onBlur={() => validateJson(payloadText)}
                rows={6}
                disabled={loading}
                className="font-mono text-xs leading-normal"
                placeholder='{ "key": "value" }'
                required
              />
              {payloadError ? (
                <p className="text-[11px] font-medium text-destructive">
                  {payloadError}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Arbitrary JSON object representing the event body.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? 'Ingesting...' : 'Ingest Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

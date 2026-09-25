'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#components/ui/select'
import { runSimulator, type SimulateRequest } from '#lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface SimulatorFormProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  onSimulateSuccess?: (count: number, eventType: string, source: string) => void
}

const priorityItems = [
  { value: 'normal', label: 'Normal Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'low', label: 'Low Priority' },
] as const

type PriorityType = 'high' | 'normal' | 'low'

export function SimulatorForm({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  onSimulateSuccess,
}: SimulatorFormProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

  const [count, setCount] = useState<number>(10)
  const [eventType, setEventType] = useState<string>('test.registration')
  const [source, setSource] = useState<string>('simulator')
  const [priority, setPriority] = useState<PriorityType>('normal')
  const [loading, setLoading] = useState<boolean>(false)
  const [countError, setCountError] = useState<string | null>(null)

  const handleCountChange = (value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num)) {
      setCount(0)
      setCountError('Count must be an integer between 1 and 1000')
      return
    }
    setCount(num)
    if (num < 1 || num > 1000) {
      setCountError('Count must be between 1 and 1000')
    } else {
      setCountError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (count < 1 || count > 1000) {
      setCountError('Count must be between 1 and 1000')
      return
    }

    if (!eventType.trim()) {
      toast.error('Validation Error', {
        description: 'Event type cannot be empty.',
      })
      return
    }

    if (!source.trim()) {
      toast.error('Validation Error', {
        description: 'Source cannot be empty.',
      })
      return
    }

    setLoading(true)

    const payload: SimulateRequest = {
      count,
      eventType: eventType.trim(),
      source: source.trim(),
      priority,
    }

    const result = await runSimulator(payload)
    setLoading(false)

    if (result.success && result.data) {
      toast.success('Simulation Enqueued', {
        description: `Successfully enqueued ${result.data.enqueued} events (ID: ${result.data.simulationId})`,
      })
      onSimulateSuccess?.(result.data.enqueued, payload.eventType, payload.source)
      setOpen(false)
    } else {
      toast.error('Simulation Failed', {
        description: result.error || 'Failed to dispatch simulated events.',
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
            <Button>Run Simulator</Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Run Load Simulator</DialogTitle>
            <DialogDescription>
              Stress test queue throughput and burst buffering by dispatching a batch
              of synthetic events to the ingestion gateway.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="sim-count"
                className="text-xs font-medium text-foreground"
              >
                Event Count (1–1000)
              </label>
              <Input
                id="sim-count"
                type="number"
                min={1}
                max={1000}
                value={count || ''}
                onChange={(e) => handleCountChange(e.target.value)}
                placeholder="10"
                required
                disabled={loading}
              />
              {countError ? (
                <p className="text-[11px] font-medium text-destructive">
                  {countError}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Number of simulated events to enqueue concurrently.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="sim-event-type"
                className="text-xs font-medium text-foreground"
              >
                Event Type
              </label>
              <Input
                id="sim-event-type"
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="test.registration"
                required
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">
                Domain event namespace (e.g., test.registration, order.created).
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="sim-source"
                className="text-xs font-medium text-foreground"
              >
                Source Identifier
              </label>
              <Input
                id="sim-source"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="simulator"
                required
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">
                Originating service or producer client tag.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="sim-priority"
                className="text-xs font-medium text-foreground"
              >
                Queue Priority
              </label>
              <Select
                value={priority}
                onValueChange={(val) => {
                  if (val === 'high' || val === 'normal' || val === 'low') {
                    setPriority(val)
                  }
                }}
                items={priorityItems}
              >
                <SelectTrigger id="sim-priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Priority assigned to the BullMQ job placement.
              </p>
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
              {loading ? 'Enqueueing...' : 'Dispatch Simulation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

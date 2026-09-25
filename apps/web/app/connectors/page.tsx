'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '#components/ui/button'
import { Input } from '#components/ui/input'
import { Textarea } from '#components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '#components/ui/dialog'
import {
  fetchConnectors,
  createConnector,
  toggleConnector,
  deleteConnector,
  type ConnectorConfig,
} from '#lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [name, setName] = useState('resend-default')
  const [type, setType] = useState('resend')
  const [configText, setConfigText] = useState(
    JSON.stringify({ to: 'you@example.com', subject: 'Welcome to Dispact' }, null, 2)
  )
  const [configError, setConfigError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchConnectors()
    setConnectors(data)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const validateConfig = (text: string): Record<string, unknown> | null => {
    try {
      const parsed: unknown = JSON.parse(text)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setConfigError('Config must be a JSON object')
        return null
      }
      setConfigError(null)
      return parsed as Record<string, unknown>
    } catch (e: unknown) {
      setConfigError(e instanceof Error ? e.message : 'Invalid JSON')
      return null
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const config = validateConfig(configText)
    if (!config) return
    setSubmitting(true)
    const result = await createConnector({ name: name.trim(), type: type.trim(), config, enabled: true })
    setSubmitting(false)
    if (result.success) {
      toast.success('Connector created')
      setDialogOpen(false)
      void load()
    } else {
      toast.error('Failed to create connector', { description: result.error })
    }
  }

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    const result = await toggleConnector(id, !currentEnabled)
    if (result.success) {
      toast.success(currentEnabled ? 'Connector disabled' : 'Connector enabled')
      void load()
    } else {
      toast.error('Failed to update connector', { description: result.error })
    }
  }

  const handleDelete = async (id: string, connName: string) => {
    if (!confirm(`Delete connector "${connName}"? This cannot be undone.`)) return
    const result = await deleteConnector(id)
    if (result.success) {
      toast.success('Connector deleted')
      void load()
    } else {
      toast.error('Failed to delete connector', { description: result.error })
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Connectors</h1>
          <p className="text-sm text-muted-foreground">
            Configure outbound delivery adapters. The worker dispatches events through enabled connectors.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button>Add Connector</Button>} />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Connector</DialogTitle>
              <DialogDescription>
                Create a new outbound delivery connector. Currently supported type: <code className="font-mono">resend</code>.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="resend-default"
                  required
                  disabled={submitting}
                />
                <p className="text-[11px] text-muted-foreground">Unique identifier for this connector.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Type</label>
                <Input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="resend"
                  required
                  disabled={submitting}
                />
                <p className="text-[11px] text-muted-foreground">Connector adapter type. Use <code className="font-mono">resend</code> for email delivery.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Config (JSON)</label>
                <Textarea
                  value={configText}
                  onChange={(e) => { setConfigText(e.target.value); if (configError) validateConfig(e.target.value) }}
                  onBlur={() => validateConfig(configText)}
                  rows={6}
                  disabled={submitting}
                  className="font-mono text-xs"
                  placeholder='{"to": "you@example.com", "subject": "Welcome"}'
                  required
                />
                {configError
                  ? <p className="text-[11px] font-medium text-destructive">{configError}</p>
                  : <p className="text-[11px] text-muted-foreground">For Resend: <code className="font-mono">to</code> (recipient email) and <code className="font-mono">subject</code> are required.</p>
                }
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {submitting ? 'Creating...' : 'Create Connector'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading connectors...</p>
      ) : connectors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No connectors configured yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a connector so the worker knows where to deliver events.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {connectors.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-medium">{c.name}</CardTitle>
                    <CardDescription className="text-xs font-mono">{c.type}</CardDescription>
                  </div>
                  <span className={`mt-0.5 rounded border px-2 py-0.5 text-[11px] font-medium ${
                    c.enabled
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}>
                    {c.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <pre className="overflow-x-auto rounded border border-border bg-muted/30 p-3 text-[11px] font-mono text-muted-foreground">
                  {JSON.stringify(c.config, null, 2)}
                </pre>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { void handleToggle(c.id, c.enabled) }}
                  >
                    {c.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:border-destructive/40 hover:text-destructive"
                    onClick={() => { void handleDelete(c.id, c.name) }}
                  >
                    Delete
                  </Button>
                  <span className="ml-auto text-[11px] text-muted-foreground font-mono">
                    Added {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium text-foreground mb-2">How connectors work</p>
        <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
          <li>When a job runs, the worker queries for the first enabled connector</li>
          <li>It looks up the connector type in the <code className="font-mono">ConnectorRegistry</code></li>
          <li>Calls <code className="font-mono">dispatch(event, config)</code> on the matching adapter</li>
          <li>For <code className="font-mono">resend</code>: sends an email to the <code className="font-mono">to</code> address with the <code className="font-mono">subject</code></li>
          <li>Delivery is logged to <code className="font-mono">DeliveryLog</code> and event status updates to DELIVERED</li>
        </ol>
      </div>
    </div>
  )
}

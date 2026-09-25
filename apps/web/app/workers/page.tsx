import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#components/ui/card'
import { Separator } from '#components/ui/separator'

export default function WorkersPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Workers</h1>
        <p className="text-sm text-muted-foreground">BullMQ worker architecture and connector pipeline.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Event Worker</CardTitle>
            <CardDescription className="text-xs">Consumes the <code className="font-mono">event-intake</code> queue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>Configurable concurrency via <code className="font-mono">WORKER_CONCURRENCY</code> env var (default: 5).</p>
            <p>Failed jobs retry up to 5 times with exponential backoff (2s base delay). After max retries, events are marked <code className="font-mono">DEAD_LETTER</code>.</p>
            <p>On shutdown (SIGTERM/SIGINT), the worker drains current jobs gracefully before exiting.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Token Bucket Rate Limiter</CardTitle>
            <CardDescription className="text-xs">Protects downstream connectors from burst traffic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>Implemented as an atomic Lua script running on Redis. Each connector has its own bucket keyed by connector type.</p>
            <p>Capacity and refill interval are configurable: <code className="font-mono">RATE_LIMIT_RESEND_TOKENS</code> and <code className="font-mono">RATE_LIMIT_RESEND_REFILL_MS</code>.</p>
            <p>If the bucket is empty, the job throws a <code className="font-mono">RateLimitError</code> and BullMQ retries it with backoff.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Connector Framework</CardTitle>
            <CardDescription className="text-xs">Pluggable outbound delivery adapters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>Connectors implement the <code className="font-mono">IConnector</code> interface with <code className="font-mono">dispatch()</code> and <code className="font-mono">validate()</code> methods.</p>
            <p>The <code className="font-mono">ConnectorRegistry</code> singleton holds all registered connectors. Currently registered: <strong>Resend</strong> (email).</p>
            <p>Connector config (target email, subject template, etc.) is stored per-row in the <code className="font-mono">ConnectorConfig</code> Postgres table.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Event Lifecycle</CardTitle>
            <CardDescription className="text-xs">Status transitions in Postgres</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <div className="space-y-1 font-mono">
              <div>QUEUED → API accepted the event</div>
              <div>PROCESSING → Worker picked it up</div>
              <div>DELIVERED → Connector dispatched successfully</div>
              <div>FAILED → Dispatch failed, will retry</div>
              <div>DEAD_LETTER → Max retries exhausted</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Bull Board</h2>
        <p className="text-xs text-muted-foreground">
          Live queue monitoring UI is served by the API gateway at{' '}
          <a href="http://localhost:4000/admin/queues" target="_blank" rel="noopener noreferrer" className="font-mono underline hover:text-foreground">
            localhost:4000/admin/queues
          </a>.
          It shows queue depth, job states, retry counts, and failure logs in real time.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Environment Variables</h2>
        <div className="rounded border border-border bg-muted/30 p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 font-medium text-foreground">Variable</th>
                <th className="pb-2 font-medium text-foreground">Default</th>
                <th className="pb-2 font-medium text-foreground">Purpose</th>
              </tr>
            </thead>
            <tbody className="font-mono text-muted-foreground">
              {[
                ['WORKER_CONCURRENCY', '5', 'Parallel job processors'],
                ['QUEUE_EVENT_INTAKE', 'event-intake', 'Primary queue name'],
                ['QUEUE_DLQ', 'event-dlq', 'Dead-letter queue name'],
                ['RATE_LIMIT_RESEND_TOKENS', '10', 'Token bucket capacity'],
                ['RATE_LIMIT_RESEND_REFILL_MS', '1000', 'Token refill interval (ms)'],
                ['RESEND_API_KEY', '—', 'Resend API secret key'],
                ['RESEND_FROM_EMAIL', '—', 'Sender email address'],
              ].map(([k, v, d]) => (
                <tr key={k} className="border-b border-border/40 last:border-0">
                  <td className="py-1.5 pr-4">{k}</td>
                  <td className="py-1.5 pr-4 text-foreground">{v}</td>
                  <td className="py-1.5 font-sans text-muted-foreground">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

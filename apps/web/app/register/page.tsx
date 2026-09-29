'use client'

import { useState } from 'react'
import { Button } from '#components/ui/button'
import { Input } from '#components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#components/ui/card'
import { sendEvent } from '#lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type FlowStep = 'idle' | 'submitting' | 'queued' | 'error'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<FlowStep>('idle')
  const [eventId, setEventId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.includes('@')) {
      toast.error('Enter a valid email address')
      return
    }

    setStep('submitting')
    setErrorMsg(null)

    const key = `user-registered-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const result = await sendEvent({
      idempotencyKey: key,
      source: 'dispact-web',
      eventType: 'user.registered',
      payload: { name, email, registeredAt: new Date().toISOString() },
    })

    if (result.success && result.data) {
      setStep('queued')
      setEventId(result.data.eventId)
      toast.success('Registration queued', {
        description: `Event ${result.data.eventId} enqueued for delivery.`,
      })
    } else {
      setStep('error')
      setErrorMsg(result.error ?? 'Unknown error')
      toast.error('Registration failed', { description: result.error })
    }
  }

  if (step === 'queued') {
    return (
      <div className="mx-auto max-w-lg py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Registration Queued</CardTitle>
            <CardDescription>
              Your registration event has been accepted and queued for delivery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded border border-border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
              Event ID: {eventId}
            </div>
            <p className="text-sm text-muted-foreground">
              The worker will now dispatch a welcome email to <strong>{email}</strong> via Resend.
              Check the <a href="http://localhost:4000/admin/queues" target="_blank" rel="noopener noreferrer" className="underline">Bull Board</a> to track processing.
            </p>
            <Button variant="outline" onClick={() => { setStep('idle'); setName(''); setEmail(''); setEventId(null) }}>
              Register another
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Register</h1>
        <p className="text-sm text-muted-foreground">
          Submit a user registration event. Dispact queues it via BullMQ and dispatches a welcome email using Resend.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-xs font-medium text-foreground">Full Name</label>
              <Input
                id="reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                disabled={step === 'submitting'}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-xs font-medium text-foreground">Email Address</label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
                disabled={step === 'submitting'}
              />
              <p className="text-[11px] text-muted-foreground">A welcome email will be sent to this address via Resend.</p>
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-destructive">{errorMsg}</p>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={step === 'submitting'} className="w-full">
                {step === 'submitting' && <Loader2 className="mr-2 size-4 animate-spin" />}
                {step === 'submitting' ? 'Queueing...' : 'Register & Send Welcome Email'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 rounded border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium text-foreground mb-2">How this works</p>
        <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
          <li>Form submits to <code className="font-mono">POST /api/v1/events</code> with a unique idempotency key</li>
          <li>Fastify validates and locks the key in Redis (prevents duplicate sends)</li>
          <li>Event is pushed to the BullMQ <code className="font-mono">event-intake</code> queue</li>
          <li>Worker picks up the job and calls the Resend connector</li>
          <li>Resend sends the email; event status updates to DELIVERED</li>
        </ol>
      </div>
    </div>
  )
}

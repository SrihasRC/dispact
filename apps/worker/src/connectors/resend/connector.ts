import { Resend } from 'resend'
import type { IConnector, DispatchResult } from '../interface.js'
import type { Event } from '@event-engine/database'
import { config as workerConfig } from '../../config.js'

export class ResendConnector implements IConnector {
  readonly name = 'resend'

  private readonly client: Resend

  constructor () {
    this.client = new Resend(workerConfig.resendApiKey)
  }

  async validate (_connectorConfig: unknown): Promise<void> {
    if (!workerConfig.resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }
  }

  async dispatch (event: Event, connectorConfig: unknown): Promise<DispatchResult> {
    const cfg = connectorConfig as { to: string, subject: string, html?: string, text?: string }

    // If the event payload carries an email address (e.g. user.registered), send there.
    // Otherwise fall back to the static connector config recipient.
    const payload = event.payload as Record<string, unknown> | null
    const toAddress =
      typeof payload?.email === 'string' && payload.email.includes('@')
        ? payload.email
        : cfg.to

    const { data, error } = await this.client.emails.send({
      from: workerConfig.resendFromEmail,
      to: toAddress,
      subject: cfg.subject,
      html: cfg.html,
      text: cfg.text ?? `Event: ${event.eventType} from ${event.source}`
    })

    if (error !== null) {
      return { success: false, error: error?.message }
    }

    return { success: true, response: data }
  }
}

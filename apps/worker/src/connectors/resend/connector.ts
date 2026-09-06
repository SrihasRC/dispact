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

    const { data, error } = await this.client.emails.send({
      from: workerConfig.resendFromEmail,
      to: cfg.to,
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

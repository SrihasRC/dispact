import type { Event } from '@event-engine/database'

export interface DispatchResult {
  success: boolean
  statusCode?: number
  response?: unknown
  error?: string
}

export interface IConnector {
  readonly name: string
  validate (config: unknown): Promise<void>
  dispatch (event: Event, connectorConfig: unknown): Promise<DispatchResult>
}

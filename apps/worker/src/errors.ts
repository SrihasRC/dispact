export class WorkerError extends Error {
  readonly kind = 'WorkerError' as const
  constructor (message: string, public readonly context?: Record<string, unknown>) {
    super(message)
    this.name = 'WorkerError'
  }
}

export class ConnectorError extends Error {
  readonly kind = 'ConnectorError' as const
  constructor (
    message: string,
    public readonly connectorName: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ConnectorError'
  }
}

export class RateLimitError extends Error {
  readonly kind = 'RateLimitError' as const
  constructor (public readonly connectorName: string) {
    super(`Rate limit exceeded for connector: ${connectorName}`)
    this.name = 'RateLimitError'
  }
}

export type WorkerErrorUnion = WorkerError | ConnectorError | RateLimitError

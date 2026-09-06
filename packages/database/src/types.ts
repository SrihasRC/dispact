import type { Event, ExecutionAttempt, DeliveryLog, ConnectorConfig } from '@prisma/client'

// Re-export Prisma model types for consumer convenience
export type { Event, ExecutionAttempt, DeliveryLog, ConnectorConfig }

// Composite type used by the worker processor — event with all relations loaded
export type EventWithRelations = Event & {
  attempts: ExecutionAttempt[]
  deliveryLogs: DeliveryLog[]
}

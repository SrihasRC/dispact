import { Type, type Static } from '@sinclair/typebox'

export const IngestEventHeaders = Type.Object({
  'x-idempotency-key': Type.String({ minLength: 8, maxLength: 128 }),
})

export const IngestEventBody = Type.Object({
  source: Type.String({ minLength: 1, maxLength: 128 }),
  eventType: Type.String({ minLength: 1, maxLength: 128 }),
  payload: Type.Record(Type.String(), Type.Unknown()),
})

export const IngestEventResponse202 = Type.Object({
  status: Type.Literal('queued'),
  eventId: Type.String(),
  at: Type.String({ format: 'date-time' }),
})

export const IngestEventResponse409 = Type.Object({
  status: Type.Literal('duplicate'),
  eventId: Type.String(),
})

export const ErrorResponse = Type.Object({
  error: Type.String(),
  message: Type.String(),
})

export type IngestEventHeadersType = Static<typeof IngestEventHeaders>
export type IngestEventBodyType = Static<typeof IngestEventBody>

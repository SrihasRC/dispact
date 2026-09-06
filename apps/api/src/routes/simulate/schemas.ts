import { Type, type Static } from '@sinclair/typebox'

export const SimulateBody = Type.Object({
  count: Type.Integer({ minimum: 1, maximum: 1000, default: 10 }),
  eventType: Type.Optional(Type.String({ default: 'test.registration' })),
  source: Type.Optional(Type.String({ default: 'simulator' })),
  priority: Type.Optional(Type.Union([
    Type.Literal('high'),
    Type.Literal('low'),
  ])),
})

export const SimulateResponse = Type.Object({
  enqueued: Type.Integer(),
  simulationId: Type.String({ format: 'uuid' }),
})

export const ErrorResponse = Type.Object({
  error: Type.String(),
  message: Type.String(),
})

export type SimulateBodyType = Static<typeof SimulateBody>

import { Type, type Static } from '@sinclair/typebox'

export const ResendConnectorConfig = Type.Object({
  to: Type.String({ format: 'email' }),
  subject: Type.String({ minLength: 1 }),
  html: Type.Optional(Type.String()),
  text: Type.Optional(Type.String())
})

export type ResendConnectorConfigType = Static<typeof ResendConnectorConfig>

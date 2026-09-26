import { Type, type Static } from '@sinclair/typebox'

export const ConfigSchema = Type.Object({
  DATABASE_URL: Type.Optional(Type.String()),
  NODE_ENV: Type.String({ default: 'development' }),
  API_PORT: Type.String({ default: '4000' }),
  API_HOST: Type.String({ default: '0.0.0.0' }),
  REDIS_HOST: Type.String({ default: '127.0.0.1' }),
  REDIS_PORT: Type.String({ default: '6379' }),
  REDIS_PASSWORD: Type.String({ default: '' }),
  IDEMPOTENCY_TTL_SECONDS: Type.String({ default: '86400' }),
  QUEUE_EVENT_INTAKE: Type.String({ default: 'event-intake' }),
  BULL_BOARD_PATH: Type.String({ default: '/admin/queues' }),
  BULL_BOARD_ENABLED: Type.String({ default: 'true' }),
})

export type AppConfig = Static<typeof ConfigSchema>

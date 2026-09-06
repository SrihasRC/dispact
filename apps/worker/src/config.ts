import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

export interface WorkerConfig {
  nodeEnv: string
  redisHost: string
  redisPort: number
  redisPassword: string
  queueEventIntake: string
  queueDlq: string
  workerConcurrency: number
  resendApiKey: string
  resendFromEmail: string
  rateLimitTokens: number
  rateLimitRefillMs: number
}

function requireEnv (key: string): string {
  const value = process.env[key]
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const config: WorkerConfig = {
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  redisHost: process.env['REDIS_HOST'] ?? '127.0.0.1',
  redisPort: Number(process.env['REDIS_PORT'] ?? '6379'),
  redisPassword: process.env['REDIS_PASSWORD'] ?? '',
  queueEventIntake: process.env['QUEUE_EVENT_INTAKE'] ?? 'event-intake',
  queueDlq: process.env['QUEUE_DLQ'] ?? 'event-dlq',
  workerConcurrency: Number(process.env['WORKER_CONCURRENCY'] ?? '5'),
  resendApiKey: requireEnv('RESEND_API_KEY'),
  resendFromEmail: requireEnv('RESEND_FROM_EMAIL'),
  rateLimitTokens: Number(process.env['RATE_LIMIT_RESEND_TOKENS'] ?? '10'),
  rateLimitRefillMs: Number(process.env['RATE_LIMIT_RESEND_REFILL_MS'] ?? '1000')
}

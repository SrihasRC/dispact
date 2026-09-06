import type { Redis } from 'ioredis'
import type { PrismaClient } from '@prisma/client'
import type { Queue } from 'bullmq'
import type { AppConfig } from '../config.js'

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig
    redis: Redis
    prisma: PrismaClient
    eventQueue: Queue
  }
}

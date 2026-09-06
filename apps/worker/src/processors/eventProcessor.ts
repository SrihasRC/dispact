import type { Job } from 'bullmq'
import type { Redis } from 'ioredis'
import { prisma } from '../prisma.js'
import { registry } from '../connectors/registry.js'
import { acquireToken } from '../rate-limiter/tokenBucket.js'
import { config } from '../config.js'
import { EventStatus, Prisma } from '@event-engine/database'

export async function processEvent (job: Job, redis: Redis): Promise<void> {
  const { idempotencyKey, source, eventType, payload } = job.data as {
    idempotencyKey: string
    source: string
    eventType: string
    payload: Record<string, unknown>
  }

  const event = await prisma.event.upsert({
    where: { idempotencyKey },
    create: {
      idempotencyKey,
      source,
      eventType,
      payload: payload as Prisma.InputJsonObject,
      status: EventStatus.PROCESSING
    },
    update: { status: EventStatus.PROCESSING }
  })

  const connectorConfig = await prisma.connectorConfig.findFirst({
    where: { enabled: true }
  })

  if (connectorConfig === null) {
    await prisma.event.update({
      where: { id: event.id },
      data: { status: EventStatus.DELIVERED }
    })
    return
  }

  const connector = registry.get(connectorConfig.type)
  if (connector === undefined) {
    throw new Error(`Unknown connector type: ${connectorConfig.type}`)
  }

  const tokenGranted = await acquireToken(
    redis,
    connectorConfig.type,
    config.rateLimitTokens,
    config.rateLimitRefillMs
  )

  if (!tokenGranted) {
    throw new Error(`Rate limit exceeded for connector: ${connectorConfig.type}`)
  }

  const result = await connector.dispatch(event, connectorConfig.config)

  await prisma.deliveryLog.create({
    data: {
      eventId: event.id,
      connector: connectorConfig.type,
      statusCode: result.statusCode,
      response: (result.response as Prisma.InputJsonObject) ?? Prisma.JsonNull
    }
  })

  await prisma.event.update({
    where: { id: event.id },
    data: { status: result.success ? EventStatus.DELIVERED : EventStatus.FAILED }
  })

  if (!result.success) {
    throw new Error(result.error ?? 'Dispatch failed')
  }
}

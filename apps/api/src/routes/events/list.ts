import type { FastifyPluginAsync } from 'fastify'
import { Type } from '@sinclair/typebox'
import type { EventStatus } from '@event-engine/database'

const EventListResponse = Type.Array(Type.Object({
  id: Type.String(),
  idempotencyKey: Type.String(),
  source: Type.String(),
  eventType: Type.String(),
  status: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
}))

interface EventItemRow {
  id: string
  idempotencyKey: string
  source: string
  eventType: string
  status: string
  createdAt: Date
  updatedAt: Date
}

const listRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/events', {
    schema: {
      querystring: Type.Object({
        limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 50 })),
        status: Type.Optional(Type.String()),
      }),
      response: { 200: EventListResponse },
    },
  }, async (request) => {
    const { limit = 50, status } = request.query as { limit?: number; status?: string }
    const events = await request.server.prisma.event.findMany({
      where: status ? { status: status as EventStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        idempotencyKey: true,
        source: true,
        eventType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return (events as EventItemRow[]).map((e: EventItemRow) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }))
  })
}

export default listRoutes

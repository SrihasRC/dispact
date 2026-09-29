import type { FastifyPluginAsync } from 'fastify'
import { Type } from '@sinclair/typebox'

const DeliveryLogSchema = Type.Object({
  id: Type.String(),
  connector: Type.String(),
  statusCode: Type.Union([Type.Integer(), Type.Null()]),
  response: Type.Unknown(),
  createdAt: Type.String(),
})

const EventDetailResponse = Type.Object({
  id: Type.String(),
  idempotencyKey: Type.String(),
  source: Type.String(),
  eventType: Type.String(),
  status: Type.String(),
  payload: Type.Unknown(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  deliveryLogs: Type.Array(DeliveryLogSchema),
})

const ErrorResponse = Type.Object({
  error: Type.String(),
  message: Type.String(),
})

interface DeliveryLogRow {
  id: string
  connector: string
  statusCode: number | null
  response: unknown
  createdAt: Date
}

interface EventDetailRow {
  id: string
  idempotencyKey: string
  source: string
  eventType: string
  status: string
  payload: unknown
  createdAt: Date
  updatedAt: Date
  deliveryLogs: DeliveryLogRow[]
}

const detailRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/events/:id', {
    schema: {
      params: Type.Object({ id: Type.String() }),
      response: {
        200: EventDetailResponse,
        404: ErrorResponse,
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const event = await request.server.prisma.event.findUnique({
      where: { id },
      include: {
        deliveryLogs: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            connector: true,
            statusCode: true,
            response: true,
            createdAt: true,
          },
        },
      },
    }) as EventDetailRow | null

    if (!event) {
      return reply.code(404).send({ error: 'Not Found', message: `Event ${id} not found` })
    }

    return {
      ...event,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      deliveryLogs: event.deliveryLogs.map((log: DeliveryLogRow) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
    }
  })
}

export default detailRoutes

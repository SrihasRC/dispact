import type { FastifyPluginAsync } from 'fastify'
import {
  IngestEventBody,
  IngestEventHeaders,
  IngestEventResponse202,
  IngestEventResponse409,
  ErrorResponse,
} from './schemas.js'
import { ingestEventHandler } from './handler.js'
import { idempotencyHook } from '../../hooks/idempotency.js'
import listRoutes from './list.js'
import detailRoutes from './detail.js'

const eventRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/events', {
    schema: {
      headers: IngestEventHeaders,
      body: IngestEventBody,
      response: {
        202: IngestEventResponse202,
        409: IngestEventResponse409,
        400: ErrorResponse,
        500: ErrorResponse,
      },
    },
    onRequest: [idempotencyHook],
  }, ingestEventHandler)

  await fastify.register(listRoutes)
  await fastify.register(detailRoutes)
}

export default eventRoutes

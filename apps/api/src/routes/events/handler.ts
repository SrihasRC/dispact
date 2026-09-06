import type { FastifyRequest, FastifyReply } from 'fastify'
import type { IngestEventBodyType, IngestEventHeadersType } from './schemas.js'

export async function ingestEventHandler (
  request: FastifyRequest<{
    Headers: IngestEventHeadersType
    Body: IngestEventBodyType
  }>,
  reply: FastifyReply
): Promise<void> {
  const idempotencyKey = request.headers['x-idempotency-key']

  await request.server.eventQueue.add(
    'dispatch-event',
    { ...request.body, idempotencyKey },
    { jobId: idempotencyKey }
  )

  await reply.code(202).send({
    status: 'queued',
    eventId: idempotencyKey,
    at: new Date().toISOString(),
  })
}

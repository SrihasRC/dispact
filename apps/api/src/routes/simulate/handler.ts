import { randomUUID } from 'node:crypto'
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { SimulateBodyType } from './schemas.js'

export async function simulateHandler (
  request: FastifyRequest<{ Body: SimulateBodyType }>,
  reply: FastifyReply
): Promise<void> {
  const {
    count = 10,
    eventType = 'test.registration',
    source = 'simulator',
    priority,
  } = request.body

  const simulationId = randomUUID()

  const jobs = Array.from({ length: count }, (_, i) => ({
    name: 'dispatch-event',
    data: {
      idempotencyKey: `${simulationId}-${i}`,
      source,
      eventType,
      payload: { simulationId, index: i },
    },
    opts: {
      jobId: `${simulationId}-${i}`,
      priority: priority === 'high' ? 1 : priority === 'low' ? 10 : undefined,
    },
  }))

  await request.server.eventQueue.addBulk(jobs)

  await reply.code(202).send({
    enqueued: count,
    simulationId,
  })
}

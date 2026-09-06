import type { FastifyRequest, FastifyReply } from 'fastify'

export async function idempotencyHook (
  request: FastifyRequest<{ Headers: { 'x-idempotency-key': string } }>,
  reply: FastifyReply
): Promise<void> {
  const idempotencyKey = request.headers['x-idempotency-key']
  if (!idempotencyKey) {
    return
  }

  const key = `idempotency:${idempotencyKey}`
  const ttl = Number(request.server.config.IDEMPOTENCY_TTL_SECONDS)

  // Attempt atomic SET NX EX
  const result = await request.server.redis.set(key, 'locked', 'EX', ttl, 'NX')

  if (result === null) {
    // Key already exists — duplicate request
    await reply.code(409).send({
      status: 'duplicate',
      eventId: idempotencyKey,
    })
  }
}

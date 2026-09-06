import fp from 'fastify-plugin'
import { Queue } from 'bullmq'
import type { FastifyPluginAsync } from 'fastify'

const queuePlugin: FastifyPluginAsync = async (fastify) => {
  const eventQueue = new Queue(
    fastify.config.QUEUE_EVENT_INTAKE,
    {
      connection: fastify.redis,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }
  )

  fastify.decorate('eventQueue', eventQueue)

  fastify.addHook('onClose', async () => {
    await eventQueue.close()
  })
}

export default fp(queuePlugin, {
  name: 'queue-plugin',
  dependencies: ['redis-plugin'],
})

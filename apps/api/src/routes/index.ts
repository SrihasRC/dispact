import type { FastifyPluginAsync } from 'fastify'
import { Queue } from 'bullmq'
import eventRoutes from './events/index.js'
import healthRoutes from './health.js'

const routes: FastifyPluginAsync = async (fastify) => {
  // Wire up the BullMQ queue and decorate it onto the instance
  const eventQueue = new Queue(
    fastify.config.QUEUE_EVENT_INTAKE,
    { connection: fastify.redis }
  )
  fastify.decorate('eventQueue', eventQueue)

  fastify.addHook('onClose', async () => {
    await eventQueue.close()
  })

  await fastify.register(healthRoutes)
  await fastify.register(eventRoutes)
}

export default routes

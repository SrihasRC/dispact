import type { FastifyPluginAsync } from 'fastify'
import eventRoutes from './events/index.js'
import healthRoutes from './health.js'
import simulateRoutes from './simulate/index.js'

// eventQueue is decorated by queuePlugin (registered in app.ts before routes)
const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(healthRoutes)
  await fastify.register(eventRoutes)
  await fastify.register(simulateRoutes)
}

export default routes

import type { FastifyPluginAsync } from 'fastify'
import { Type } from '@sinclair/typebox'

const HealthResponse = Type.Object({
  status: Type.Literal('ok'),
  uptime: Type.Number(),
})

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', {
    schema: { response: { 200: HealthResponse } },
  }, async () => ({
    status: 'ok' as const,
    uptime: process.uptime(),
  }))
}

export default healthRoutes

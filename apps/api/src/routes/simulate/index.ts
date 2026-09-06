import type { FastifyPluginAsync } from 'fastify'
import { SimulateBody, SimulateResponse, ErrorResponse } from './schemas.js'
import { simulateHandler } from './handler.js'

const simulateRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/simulate', {
    schema: {
      body: SimulateBody,
      response: {
        202: SimulateResponse,
        400: ErrorResponse,
        500: ErrorResponse,
      },
    },
  }, simulateHandler)
}

export default simulateRoutes

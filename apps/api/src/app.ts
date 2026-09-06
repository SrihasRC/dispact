import Fastify, { type FastifyError, type FastifyInstance, type FastifyServerOptions } from 'fastify'
import cors from '@fastify/cors'
import envPlugin from '@fastify/env'
import { ConfigSchema } from './config.js'
import redisPlugin from './plugins/redis.js'
import prismaPlugin from './plugins/prisma.js'
import queuePlugin from './plugins/queue.js'
import bullBoardPlugin from './plugins/bull-board.js'
import routes from './routes/index.js'

export async function buildApp (opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger ?? { level: 'info' },
    ...opts,
  })

  // Config first — all plugins depend on fastify.config
  await app.register(envPlugin, {
    schema: ConfigSchema,
    dotenv: true,
  })

  await app.register(cors)
  await app.register(redisPlugin)
  await app.register(prismaPlugin)
  await app.register(queuePlugin)
  await app.register(bullBoardPlugin)

  // Global error handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    // Validation errors from TypeBox/AJV
    if (error.validation != null) {
      return reply.code(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation,
      })
    }
    // Known HTTP errors (e.g. 404, 409)
    if (error.statusCode != null && error.statusCode < 500) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      })
    }
    // Unhandled server errors — log full error, return sanitized response
    app.log.error({ err: error, reqId: request.id }, 'Unhandled server error')
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    })
  })

  // Routes registered under /api/v1 prefix
  await app.register(routes, { prefix: '/api/v1' })

  return app
}

import Fastify, { type FastifyError, type FastifyInstance, type FastifyServerOptions } from 'fastify'
import cors from '@fastify/cors'
import envPlugin from '@fastify/env'
import { ConfigSchema } from './config.js'
import redisPlugin from './plugins/redis.js'
import prismaPlugin from './plugins/prisma.js'
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

  // Global error handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation != null) {
      return reply.code(400).send({
        error: 'Validation Error',
        message: error.message,
      })
    }
    app.log.error({ err: error, reqId: request.id }, 'Unhandled error')
    return reply.code(error.statusCode ?? 500).send({
      error: error.name,
      message: error.message,
    })
  })

  // Routes registered under /api/v1 prefix
  await app.register(routes, { prefix: '/api/v1' })

  return app
}

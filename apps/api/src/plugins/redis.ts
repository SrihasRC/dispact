import fp from 'fastify-plugin'
import { Redis } from 'ioredis'
import type { FastifyPluginAsync } from 'fastify'

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  const redis = new Redis({
    host: fastify.config.REDIS_HOST,
    port: Number(fastify.config.REDIS_PORT),
    password: fastify.config.REDIS_PASSWORD || undefined,
    lazyConnect: true,
  })

  await redis.connect()

  fastify.decorate('redis', redis)

  fastify.addHook('onClose', async () => {
    await redis.quit()
  })
}

export default fp(redisPlugin, { name: 'redis-plugin' })

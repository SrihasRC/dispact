import fp from 'fastify-plugin'
import { prisma } from '@event-engine/database'
import type { FastifyPluginAsync } from 'fastify'

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
}

export default fp(prismaPlugin, { name: 'prisma-plugin' })

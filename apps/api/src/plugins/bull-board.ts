import fp from 'fastify-plugin'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { FastifyAdapter } from '@bull-board/fastify'
import type { FastifyPluginAsync } from 'fastify'

const bullBoardPlugin: FastifyPluginAsync = async (fastify) => {
  if (fastify.config.BULL_BOARD_ENABLED !== 'true') {
    fastify.log.info('Bull Board disabled (BULL_BOARD_ENABLED != true)')
    return
  }

  const serverAdapter = new FastifyAdapter()

  createBullBoard({
    queues: [new BullMQAdapter(fastify.eventQueue)],
    serverAdapter,
  })

  serverAdapter.setBasePath(fastify.config.BULL_BOARD_PATH)

  await fastify.register(serverAdapter.registerPlugin(), {
    prefix: fastify.config.BULL_BOARD_PATH,
    logLevel: 'warn',
  })

  fastify.log.info(`Bull Board available at ${fastify.config.BULL_BOARD_PATH}`)
}

export default fp(bullBoardPlugin, {
  name: 'bull-board-plugin',
  dependencies: ['redis-plugin', 'queue-plugin'],
})

import 'dotenv/config'
import { redis } from './redis.js'
import { createEventWorker } from './workers/eventWorker.js'
import { registry } from './connectors/registry.js'
import { ResendConnector } from './connectors/resend/connector.js'

registry.register(new ResendConnector())

await redis.connect()

const worker = createEventWorker()
console.log('[Worker] Listening on event-intake queue...')
console.log(`[Worker] Registered connectors: ${registry.getAll().map(c => c.name).join(', ')}`)

async function shutdown (): Promise<void> {
  console.log('[Worker] Shutting down...')
  await worker.close()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', () => {
  shutdown().catch((err: unknown) => {
    console.error('[Worker] Error during shutdown:', err)
  })
})
process.on('SIGINT', () => {
  shutdown().catch((err: unknown) => {
    console.error('[Worker] Error during shutdown:', err)
  })
})

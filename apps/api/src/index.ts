import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Queue } from 'bullmq'

const app = Fastify({ logger: true })
await app.register(cors)

const eventQueue = new Queue('event-intake', {
  connection: { host: '127.0.0.1', port: 6379 }
})

app.get('/health', async () => ({ status: 'ok' }))

app.post('/api/v1/events', async (request, reply) => {
  await eventQueue.add('dispatch-event', request.body)
  return reply.status(202).send({ status: 'queued', at: new Date().toISOString() })
})

app.listen({ port: 4000, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err
  console.log(`API Gateway running on ${address}`)
})

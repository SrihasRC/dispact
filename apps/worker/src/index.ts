import { Worker, type Job } from 'bullmq'

const worker = new Worker('event-intake', async (job: Job) => {
  console.log(`[Worker] Processing Job ID: ${job.id}`, job.data)
}, {
  connection: { host: '127.0.0.1', port: 6379 }
})

worker.on('completed', (job: Job) => {
  console.log(`[Worker] Completed Job ID: ${job.id}`)
})

console.log('Worker listening on event-intake queue...')

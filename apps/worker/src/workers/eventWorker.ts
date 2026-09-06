import { Worker, type Job } from 'bullmq'
import { redis } from '../redis.js'
import { config } from '../config.js'
import { processEvent } from '../processors/eventProcessor.js'
import { prisma } from '../prisma.js'
import { EventStatus } from '@event-engine/database'

export function createEventWorker (): Worker {
  const worker = new Worker(
    config.queueEventIntake,
    async (job: Job) => processEvent(job, redis),
    {
      connection: redis,
      concurrency: config.workerConcurrency,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 }
    }
  )

  worker.on('failed', async (job, error) => {
    if (job !== undefined && job.attemptsMade >= (job.opts.attempts ?? 1)) {
      const { idempotencyKey } = job.data as { idempotencyKey: string }
      await prisma.event.updateMany({
        where: { idempotencyKey },
        data: { status: EventStatus.DEAD_LETTER }
      })
    }
    console.error(`[Worker] Job ${job?.id ?? 'unknown'} failed:`, error.message)
  })

  return worker
}

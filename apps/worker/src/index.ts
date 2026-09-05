import { Worker } from 'bullmq';

const worker = new Worker('event-intake', async (job) => {
  console.log(`[Worker] Processing Job ID: ${job.id}`, job.data);
}, {
  connection: { host: '127.0.0.1', port: 6379 }
});

worker.on('completed', (job) => {
  console.log(`[Worker] Completed Job ID: ${job.id}`);
});

console.log('Worker listening on event-intake queue...');
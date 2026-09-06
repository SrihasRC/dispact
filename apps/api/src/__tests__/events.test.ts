import { describe, it, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { buildApp } from '../app.js'
import type { FastifyInstance } from 'fastify'

describe('POST /api/v1/events', () => {
  let app: FastifyInstance

  before(async () => {
    app = await buildApp({ logger: false })
    await app.ready()
  })

  beforeEach(async () => {
    await app.redis.del(
      'idempotency:test-key-12345678',
      'idempotency:valid-key-unique-abc123',
      'idempotency:duplicate-key-xyz9876'
    )
    const existingJob = await app.eventQueue.getJob('valid-key-unique-abc123')
    if (existingJob) {
      await existingJob.remove()
    }
    const existingDup = await app.eventQueue.getJob('duplicate-key-xyz9876')
    if (existingDup) {
      await existingDup.remove()
    }
  })

  after(async () => {
    await app.redis.del(
      'idempotency:test-key-12345678',
      'idempotency:valid-key-unique-abc123',
      'idempotency:duplicate-key-xyz9876'
    )
    await app.close()
  })

  it('returns 400 when x-idempotency-key header is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      payload: {
        source: 'test',
        eventType: 'test.event',
        payload: { data: 'value' },
      },
    })
    assert.equal(res.statusCode, 400)
  })

  it('returns 400 when body is missing required fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: { 'x-idempotency-key': 'test-key-12345678' },
      payload: {},
    })
    assert.equal(res.statusCode, 400)
  })

  it('returns 202 for a valid event', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: { 'x-idempotency-key': 'valid-key-unique-abc123' },
      payload: {
        source: 'test-suite',
        eventType: 'test.registration',
        payload: { userId: '42' },
      },
    })
    assert.equal(res.statusCode, 202)
    const body = res.json<{ status: string; eventId: string }>()
    assert.equal(body.status, 'queued')
    assert.equal(body.eventId, 'valid-key-unique-abc123')
  })

  it('returns 409 for a duplicate idempotency key', async () => {
    const key = 'duplicate-key-xyz9876'
    // First request
    await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: { 'x-idempotency-key': key },
      payload: {
        source: 'test-suite',
        eventType: 'test.registration',
        payload: { userId: '99' },
      },
    })
    // Duplicate
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: { 'x-idempotency-key': key },
      payload: {
        source: 'test-suite',
        eventType: 'test.registration',
        payload: { userId: '99' },
      },
    })
    assert.equal(res.statusCode, 409)
    const body = res.json<{ status: string }>()
    assert.equal(body.status, 'duplicate')
  })
})

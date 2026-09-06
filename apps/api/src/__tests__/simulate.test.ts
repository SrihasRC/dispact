import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { buildApp } from '../app.js'
import type { FastifyInstance } from 'fastify'

describe('POST /api/v1/simulate', () => {
  let app: FastifyInstance

  before(async () => {
    app = await buildApp({ logger: false })
    await app.ready()
  })

  after(async () => {
    await app.close()
  })

  it('returns 202 with enqueued count and simulationId', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulate',
      payload: { count: 5, eventType: 'test.load' },
    })
    assert.equal(res.statusCode, 202)
    const body = res.json<{ enqueued: number; simulationId: string }>()
    assert.equal(body.enqueued, 5)
    assert.match(body.simulationId, /^[0-9a-f-]{36}$/)
  })

  it('returns 400 when count exceeds maximum', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulate',
      payload: { count: 9999 },
    })
    assert.equal(res.statusCode, 400)
  })

  it('returns 400 when count is less than minimum', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulate',
      payload: { count: 0 },
    })
    assert.equal(res.statusCode, 400)
  })
})

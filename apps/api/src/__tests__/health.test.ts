import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { buildApp } from '../app.js'
import type { FastifyInstance } from 'fastify'

describe('GET /api/v1/health', () => {
  let app: FastifyInstance

  before(async () => {
    app = await buildApp({ logger: false })
    await app.ready()
  })

  after(async () => {
    await app.close()
  })

  it('returns 200 with status ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    })
    assert.equal(res.statusCode, 200)
    const body = res.json<{ status: string; uptime: number }>()
    assert.equal(body.status, 'ok')
    assert.equal(typeof body.uptime, 'number')
  })
})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { WorkerError, ConnectorError, RateLimitError } from '../errors.js'

describe('Typed Error Classes', () => {
  it('WorkerError has correct kind and name', () => {
    const err = new WorkerError('something went wrong', { jobId: '123' })
    assert.equal(err.kind, 'WorkerError')
    assert.equal(err.name, 'WorkerError')
    assert.equal(err.message, 'something went wrong')
    assert.deepEqual(err.context, { jobId: '123' })
    assert.ok(err instanceof Error)
  })

  it('ConnectorError has correct kind, name, and connectorName', () => {
    const err = new ConnectorError('dispatch failed', 'resend')
    assert.equal(err.kind, 'ConnectorError')
    assert.equal(err.connectorName, 'resend')
    assert.ok(err instanceof Error)
  })

  it('RateLimitError has correct kind and message', () => {
    const err = new RateLimitError('resend')
    assert.equal(err.kind, 'RateLimitError')
    assert.equal(err.message, 'Rate limit exceeded for connector: resend')
    assert.ok(err instanceof Error)
  })
})

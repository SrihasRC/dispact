import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { registry } from '../connectors/registry.js'
import type { IConnector, DispatchResult } from '../connectors/interface.js'
import type { Event } from '@event-engine/database'

const mockConnector: IConnector = {
  name: 'mock-connector',
  async validate (_config: unknown): Promise<void> {
    // no-op for mock validation
  },
  async dispatch (_event: Event, _config: unknown): Promise<DispatchResult> {
    return { success: true, statusCode: 200 }
  },
}

describe('ConnectorRegistry', () => {
  it('registers and retrieves a connector', () => {
    registry.register(mockConnector)
    const found = registry.get('mock-connector')
    assert.equal(found?.name, 'mock-connector')
  })

  it('returns undefined for unregistered connector', () => {
    const notFound = registry.get('nonexistent-connector')
    assert.equal(notFound, undefined)
  })

  it('getAll returns all registered connectors', () => {
    const all = registry.getAll()
    assert.ok(Array.isArray(all))
  })
})

import type { Redis } from 'ioredis'

const TOKEN_BUCKET_LUA = `
local key      = KEYS[1]
local capacity = tonumber(ARGV[1])
local now      = tonumber(ARGV[2])
local refillMs = tonumber(ARGV[3])

local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
local tokens    = tonumber(data[1]) or capacity
local lastRefill = tonumber(data[2]) or now

local elapsed = now - lastRefill
local refilled = math.floor(elapsed / refillMs)
tokens = math.min(capacity, tokens + refilled)
local newLastRefill = lastRefill + (refilled * refillMs)

if tokens <= 0 then
  redis.call('HSET', key, 'tokens', tokens, 'lastRefill', newLastRefill)
  redis.call('PEXPIRE', key, refillMs * 2)
  return 0
end

tokens = tokens - 1
redis.call('HSET', key, 'tokens', tokens, 'lastRefill', newLastRefill)
redis.call('PEXPIRE', key, refillMs * 2)
return 1
`

export async function acquireToken (
  redis: Redis,
  key: string,
  capacity: number,
  refillMs: number
): Promise<boolean> {
  const result = await redis.eval(
    TOKEN_BUCKET_LUA,
    1,
    `rate-limit:${key}`,
    String(capacity),
    String(Date.now()),
    String(refillMs)
  )
  return result === 1
}

import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { LogAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createGetLevel (client: HTTPRPCClient): LogAPI['getLevel'] {
  return async function getLevel (subsystem = 'all', options = {}) {
    const res = await client.post('log/level', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: subsystem,
        ...options
      }),
      headers: options.headers
    })

    const data = await res.json()
    return data.Levels
  }
}

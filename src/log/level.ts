import { objectToCamel } from '../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { LogAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createLevel (client: HTTPRPCClient): LogAPI['level'] {
  return async function level (subsystem, level, options = {}) {
    const res = await client.post('log/level', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          subsystem,
          level
        ],
        ...options
      }),
      headers: options.headers
    })

    return objectToCamel(await res.json())
  }
}

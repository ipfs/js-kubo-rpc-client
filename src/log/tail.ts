import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { LogAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createTail (client: HTTPRPCClient): LogAPI['tail'] {
  return async function * tail (options = {}) {
    const res = await client.post('log/tail', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    yield * res.ndjson()
  }
}

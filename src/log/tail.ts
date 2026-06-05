import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { LogAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

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

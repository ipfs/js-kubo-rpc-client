import { objectToCamel } from '../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { RefsAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createLocal (client: HTTPRPCClient): RefsAPI['local'] {
  return async function * refsLocal (options = {}) {
    const res = await client.post('refs/local', {
      signal: options.signal,
      transform: objectToCamel,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    yield * res.ndjson()
  }
}

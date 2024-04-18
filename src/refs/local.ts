import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { RefsAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

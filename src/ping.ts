import { objectToCamel } from './lib/object-to-camel.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { KuboRPCClient } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

export function createPing (client: HTTPRPCClient): KuboRPCClient['ping'] {
  return async function * ping (peerId, options = {}) {
    const res = await client.post('ping', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${peerId}`,
        ...options
      }),
      headers: options.headers,
      transform: objectToCamel
    })

    yield * res.ndjson()
  }
}

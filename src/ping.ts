import { objectToCamel } from './lib/object-to-camel.ts'
import { toUrlSearchParams } from './lib/to-url-search-params.ts'
import type { KuboRPCClient } from './index.ts'
import type { HTTPRPCClient } from './lib/core.ts'

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

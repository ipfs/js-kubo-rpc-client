import { mapEvent } from '../dht/map-event.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { RoutingAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createFindProvs (client: HTTPRPCClient): RoutingAPI['findProvs'] {
  return async function * findProvs (cid, options = {}) {
    const res = await client.post('routing/findprovs', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }
}

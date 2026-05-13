import { mapEvent } from '../dht/map-event.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { RoutingAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

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

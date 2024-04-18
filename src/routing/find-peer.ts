import { mapEvent } from '../dht/map-event.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { RoutingAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createFindPeer (client: HTTPRPCClient): RoutingAPI['findPeer'] {
  return async function * findPeer (peerId, options = {}) {
    const res = await client.post('routing/findpeer', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: peerId.toString(),
        stream: true,
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }
}

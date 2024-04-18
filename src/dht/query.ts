import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'
import type { DHTAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createQuery (client: HTTPRPCClient): DHTAPI['query'] {
  return async function * query (peerId, options = {}) {
    const res = await client.post('dht/query', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: peerId.toString(),
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }
}

import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { mapEvent } from '../dht/map-event.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { RoutingAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createGet (client: HTTPRPCClient): RoutingAPI['get'] {
  return async function * get (key, options = {}) {
    const res = await client.post('routing/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key instanceof Uint8Array ? uint8ArrayToString(key) : key.toString(),
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }
}

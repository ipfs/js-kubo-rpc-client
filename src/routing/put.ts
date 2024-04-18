import { anySignal } from 'any-signal'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { mapEvent } from '../dht/map-event.js'
import { multipartRequest } from '../lib/multipart-request.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { RoutingAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createPut (client: HTTPRPCClient): RoutingAPI['put'] {
  return async function * put (key, value, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])

    try {
      const res = await client.post('routing/put', {
        signal,
        searchParams: toUrlSearchParams({
          arg: key instanceof Uint8Array ? uint8ArrayToString(key) : key.toString(),
          stream: true,
          ...options
        }),
        ...(
          await multipartRequest([value], controller, options.headers)
        )
      })

      for await (const event of res.ndjson()) {
        yield mapEvent(event)
      }
    } finally {
      signal.clear()
    }
  }
}

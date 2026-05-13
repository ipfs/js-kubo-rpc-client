import { mapEvent } from '../dht/map-event.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { RoutingAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createProvide (client: HTTPRPCClient): RoutingAPI['provide'] {
  return async function * provide (cids, options = { recursive: false }) {
    const cidArr = Array.isArray(cids) ? cids : [cids]

    const res = await client.post('routing/provide', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cidArr.map(cid => cid.toString()),
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }
}

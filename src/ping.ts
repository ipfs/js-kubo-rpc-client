import { objectToCamel } from './lib/object-to-camel.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Client } from './lib/core.js'
import type { PingOptions, PingResult } from './root.js'

export function createPing (client: Client) {
  async function * ping (peerId: PeerId, options?: PingOptions): AsyncIterable<PingResult> {
    const res = await client.post('ping', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: peerId.toString(),
        ...options
      }),
      headers: options?.headers,
      transform: objectToCamel
    })

    yield * res.ndjson()
  }

  return ping
}

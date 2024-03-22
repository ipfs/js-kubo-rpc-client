import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from '../routing/map-event.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'
import type { QueryEvent } from '../routing/index.js'
import type { CID } from 'multiformats'

export function createQuery (client: Client) {
  async function * query (peerId: PeerId | CID, options?: ClientOptions): AsyncIterable<QueryEvent> {
    const res = await client.post('dht/query', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: peerId.toString(),
        ...options
      }),
      headers: options?.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return query
}

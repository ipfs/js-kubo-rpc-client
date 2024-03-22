import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'
import type { QueryEvent } from './index.js'

export function createFindPeer (client: Client) {
  async function * findPeer (peerId: PeerId, options?: ClientOptions): AsyncIterable<QueryEvent> {
    const res = await client.post('routing/findpeer', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: peerId,
        ...options
      }),
      headers: options?.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return findPeer
}

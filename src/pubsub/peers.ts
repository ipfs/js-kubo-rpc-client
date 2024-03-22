import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { textToUrlSafeRpc } from '../lib/http-rpc-wire-format.js'
import type { ClientOptions } from '../index.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Client } from '../lib/core.js'

export function createPeers (client: Client) {
  async function peers (topic: string, options?: ClientOptions): Promise<PeerId[]> {
    const res = await client.post('pubsub/peers', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: textToUrlSafeRpc(topic),
        ...options
      }),
      headers: options?.headers
    })

    const { Strings } = await res.json()

    return Strings ?? []
  }

  return peers
}

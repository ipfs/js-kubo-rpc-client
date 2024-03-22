import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createConnect (client: Client) {
  async function connect (addr: Multiaddr | PeerId, options?: ClientOptions): Promise<void> {
    const res = await client.post('swarm/connect', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options?.headers
    })
    const { Strings } = await res.json()
    return Strings ?? []
  }

  return connect
}

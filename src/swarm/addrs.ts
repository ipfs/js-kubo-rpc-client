import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { peerIdFromString } from '@libp2p/peer-id'
import { multiaddr } from '@multiformats/multiaddr'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'
import type { AddrsResult } from './index.js'

export function createAddrs (client: Client) {
  async function addrs (options?: ClientOptions): Promise<AddrsResult[]> {
    const res = await client.post('swarm/addrs', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    const { Addrs } = await res.json()

    return Object.keys(Addrs).map(id => ({
      id: peerIdFromString(id),
      addrs: (Addrs[id] ?? []).map((a: any) => multiaddr(a))
    }))
  }

  return addrs
}

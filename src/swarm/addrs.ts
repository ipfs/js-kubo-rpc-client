import { peerIdFromString } from '@libp2p/peer-id'
import { multiaddr } from '@multiformats/multiaddr'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { SwarmAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createAddrs (client: HTTPRPCClient): SwarmAPI['addrs'] {
  return async function addrs (options = {}) {
    const res = await client.post('swarm/addrs', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const { Addrs } = await res.json()

    return Object.keys(Addrs).map(id => ({
      id: peerIdFromString(id),
      addrs: (Addrs[id] ?? []).map((a: any) => multiaddr(a))
    }))
  }
}

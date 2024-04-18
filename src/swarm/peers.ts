import { peerIdFromString } from '@libp2p/peer-id'
import { multiaddr } from '@multiformats/multiaddr'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { SwarmAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createPeers (client: HTTPRPCClient): SwarmAPI['peers'] {
  return async function peers (options = {}) {
    const res = await client.post('swarm/peers', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const body = await res.json()

    return (body.Peers ?? []).map((peer: any) => {
      return {
        addr: multiaddr(peer.Addr),
        peer: peerIdFromString(peer.Peer),
        muxer: peer.Muxer,
        latency: peer.Latency,
        streams: peer.Streams,
        // eslint-disable-next-line no-nested-ternary
        direction: peer.Direction == null ? undefined : peer.Direction === 0 ? 'inbound' : 'outbound'
      }
    })
  }
}

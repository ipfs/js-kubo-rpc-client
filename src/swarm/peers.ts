import { multiaddr } from '@multiformats/multiaddr'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { peerIdFromString } from '@libp2p/peer-id'
import type { Client } from '../lib/core.js'
import type { PeersOptions, PeersResult } from './index.js'

export function createPeers (client: Client) {
  async function peers (options?: PeersOptions): Promise<PeersResult[]> {
    const res = await client.post('swarm/peers', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    const { Peers } = await res.json()

    return (Peers ?? []).map((peer: any) => {
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

  return peers
}

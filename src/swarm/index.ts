import { createAddrs } from './addrs.js'
import { createConnect } from './connect.js'
import { createDisconnect } from './disconnect.js'
import { createLocalAddrs } from './local-addrs.js'
import { createPeers } from './peers.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Multiaddr } from '@multiformats/multiaddr'

export function createSwarm (client: Client): SwarmAPI {
  return {
    addrs: createAddrs(client),
    connect: createConnect(client),
    disconnect: createDisconnect(client),
    localAddrs: createLocalAddrs(client),
    peers: createPeers(client)
  }
}

export interface SwarmAPI {
  /**
   * List of known addresses of each peer connected
   */
  addrs: (options?: ClientOptions) => Promise<AddrsResult[]>

  /**
   * Open a connection to a given address or peer id
   */
  connect: (multiaddrOrPeerId: Multiaddr | PeerId, options?: ClientOptions) => Promise<void>

  /**
   * Close a connection to a given address or peer id
   */
  disconnect: (multiaddrOrPeerId: Multiaddr | PeerId, options?: ClientOptions) => Promise<void>

  /**
   * Local addresses this node is listening on
   */
  localAddrs: (options?: ClientOptions) => Promise<Multiaddr[]>

  /**
   * Return a list of connected peers
   */
  peers: (options?: PeersOptions) => Promise<PeersResult[]>
}

export interface AddrsResult {
  id: PeerId
  addrs: Multiaddr[]
}

export interface PeersOptions extends ClientOptions {
  direction?: boolean
  streams?: boolean
  verbose?: boolean
  latency?: boolean
}

export interface PeersResult {
  addr: Multiaddr
  peer: PeerId
  latency?: string
  muxer?: string
  streams?: string[]
  direction?: 'inbound' | 'outbound'
}

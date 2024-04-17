import { createAddrs } from './addrs.js'
import { createConnect } from './connect.js'
import { createDisconnect } from './disconnect.js'
import { createLocalAddrs } from './local-addrs.js'
import { createPeers } from './peers.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { PeerId } from '@libp2p/interface'
import type { Multiaddr } from '@multiformats/multiaddr'

export interface SwarmAPI {
  /**
   * List of known addresses of each peer connected
   */
  addrs(options?: HTTPRPCOptions): Promise<AddrsResult[]>

  /**
   * Open a connection to a given address or peer id
   */
  connect(multiaddrOrPeerId: Multiaddr | PeerId, options?: HTTPRPCOptions): Promise<void>

  /**
   * Close a connection to a given address or peer id
   */
  disconnect(multiaddrOrPeerId: Multiaddr | PeerId, options?: HTTPRPCOptions): Promise<void>

  /**
   * Local addresses this node is listening on
   */
  localAddrs(options?: HTTPRPCOptions): Promise<Multiaddr[]>

  /**
   * Return a list of connected peers
   */
  peers(options?: SwarmPeersOptions): Promise<SwarmPeersResult[]>
}

export interface AddrsResult {
  id: PeerId
  addrs: Multiaddr[]
}

export interface SwarmPeersOptions extends HTTPRPCOptions {
  direction?: boolean
  streams?: boolean
  verbose?: boolean
  latency?: boolean
}

export interface SwarmPeersResult {
  addr: Multiaddr
  peer: PeerId
  latency?: string
  muxer?: string
  streams?: string[]
  direction?: 'inbound' | 'outbound'
  error?: Error
}

export function createSwarm (client: HTTPRPCClient): SwarmAPI {
  return {
    addrs: createAddrs(client),
    connect: createConnect(client),
    disconnect: createDisconnect(client),
    localAddrs: createLocalAddrs(client),
    peers: createPeers(client)
  }
}

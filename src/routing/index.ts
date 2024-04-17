import { createFindPeer } from './find-peer.js'
import { createFindProvs } from './find-provs.js'
import { createGet } from './get.js'
import { createProvide } from './provide.js'
import { createPut } from './put.js'
import type { RoutingQueryEvent } from '../dht/index.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { PeerId } from '@libp2p/interface'
import type { CID } from 'multiformats/cid'

export interface RoutingFindProvsOptions extends HTTPRPCOptions {
  /**
   * How many providers to find
   *
   * @default 20
   */
  numProviders?: number
}

export interface RoutingPutOptions extends HTTPRPCOptions {
  /**
   * When offline, save the IPNS record to the local datastore without
   * broadcasting to the network instead of simply failing
   */
  allowOffline?: boolean
}

export interface RoutingProvideOptions extends HTTPRPCOptions {
  /**
   * Recursively provide entire graph.
   */
  recursive?: boolean
}

export interface RoutingAPI {
  findPeer(peerId: string | PeerId, options?: HTTPRPCOptions): AsyncIterable<RoutingQueryEvent>
  findProvs(key: string | CID, options?: RoutingFindProvsOptions): AsyncIterable<RoutingQueryEvent>
  get(key: string | Uint8Array, options?: HTTPRPCOptions): AsyncIterable<RoutingQueryEvent>
  put(key: string | Uint8Array, value: Uint8Array, options?: RoutingPutOptions): AsyncIterable<RoutingQueryEvent>
  provide(key: string | string[] | CID | CID[], options?: RoutingProvideOptions): AsyncIterable<RoutingQueryEvent>
}

export function createRouting (client: HTTPRPCClient): RoutingAPI {
  return {
    findPeer: createFindPeer(client),
    findProvs: createFindProvs(client),
    get: createGet(client),
    provide: createProvide(client),
    put: createPut(client)
  }
}

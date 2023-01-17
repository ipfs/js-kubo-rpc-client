import { createQuery } from './query.js'
import { createRouting, ProvideOptions, QueryEvent } from '../routing/index.js'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { CID } from 'multiformats'

export function createDht (client: Client): DhtAPI {
  const routing = createRouting(client)

  return {
    findPeer: routing.findPeer,
    findProvs: routing.findProvs,
    get: routing.get,
    provide: routing.provide,
    put: routing.put,
    query: createQuery(client)
  }
}

export interface DhtAPI {
  /**
   * @deprecated use routing.findPeer instead.
   */
  findPeer: (peerId: PeerId, options?: ClientOptions) => AsyncIterable<QueryEvent>

  /**
   * @deprecated use routing.findProvs instead.
   */
  findProvs: (cid: CID, options?: ClientOptions) => AsyncIterable<QueryEvent>

  /**
   * @deprecated use routing.get instead.
   */
  get: (key: string | Uint8Array, options?: ClientOptions) => AsyncIterable<QueryEvent>

  /**
   * @deprecated use routing.provide instead.
   */
  provide: (cid: CID, options?: ProvideOptions) => AsyncIterable<QueryEvent>

  /**
   * @deprecated use routing.put instead.
   */
  put: (key: string | Uint8Array, value: Uint8Array, options?: ClientOptions) => AsyncIterable<QueryEvent>

  /**
   * Find the closest peers to a given `PeerId` or `CID`, by querying the DHT.
   */
  query: (peerId: PeerId | CID, options?: ClientOptions) => AsyncIterable<QueryEvent>
}

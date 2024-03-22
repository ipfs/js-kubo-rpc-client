import { createAdd } from './add.js'
import { createList } from './list.js'
import { createRm } from './rm.js'
import type { ClientOptions } from '../index.js'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { Client } from '../lib/core.js'

export function createBootstrap (client: Client): BootstrapAPI {
  return {
    add: createAdd(client),
    list: createList(client),
    rm: createRm(client)
  }
}

// TODO: https://github.com/ipfs/js-kubo-rpc-client/issues/96
export interface BootstrapAPI {
  /**
   * Add a peer address to the bootstrap list
   *
   * @example
   * ```js
   * const validIp4 = '/ip4/104....9z'
   *
   * const res = await ipfs.bootstrap.add(validIp4)
   * console.log(res.Peers)
   * // Logs:
   * // ['/ip4/104....9z']
   * ```
   */
  add: (addr: Multiaddr, options?: ClientOptions) => Promise<{ Peers: Multiaddr[] }>

  /**
   * List all peer addresses in the bootstrap list
   *
   * @example
   * ```js
   * const res = await ipfs.bootstrap.list()
   * console.log(res.Peers)
   * // Logs:
   * // [address1, address2, ...]
   * ```
   */
  list: (options?: ClientOptions) => Promise<{ Peers: Multiaddr[] }>

  /**
   * Remove a peer address from the bootstrap list
   *
   * @example
   * ```js
   * const res = await ipfs.bootstrap.list()
   * console.log(res.Peers)
   * // Logs:
   * // [address1, address2, ...]
   * ```
   */
  rm: (addr: Multiaddr, options?: ClientOptions) => Promise<{ Peers: Multiaddr[] }>
}

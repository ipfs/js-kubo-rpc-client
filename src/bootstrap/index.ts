import { createAdd } from './add.ts'
import { createList } from './list.ts'
import { createRm } from './rm.ts'
import type { HTTPRPCOptions } from '../index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'
import type { Multiaddr } from '@multiformats/multiaddr'

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
  add(addr: Multiaddr, options?: HTTPRPCOptions): Promise<{ Peers: Multiaddr[] }>

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
  list(options?: HTTPRPCOptions): Promise<{ Peers: Multiaddr[] }>

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
  rm(addr: Multiaddr, options?: HTTPRPCOptions): Promise<{ Peers: Multiaddr[] }>
}

export function createBootstrap (client: HTTPRPCClient): BootstrapAPI {
  return {
    add: createAdd(client),
    list: createList(client),
    rm: createRm(client)
  }
}

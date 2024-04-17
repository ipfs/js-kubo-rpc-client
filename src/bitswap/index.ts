import { createStat } from './stat.js'
import { createWantlistForPeer } from './wantlist-for-peer.js'
import { createWantlist } from './wantlist.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { PeerId } from '@libp2p/interface'
import type { CID } from 'multiformats/cid'

export interface BitswapStats {
  provideBufLen: number
  wantlist: CID[]
  peers: PeerId[]
  blocksReceived: bigint
  dataReceived: bigint
  blocksSent: bigint
  dataSent: bigint
  dupBlksReceived: bigint
  dupDataReceived: bigint
}

export interface BitswapAPI {
  /**
   * Show diagnostic information on the bitswap agent.
   * Note: `bitswap.stat` and `stats.bitswap` can be used interchangeably.
   *
   * @example
   * ```js
   * const stats = await ipfs.bitswap.stat()
   * console.log(stats)
   * ```
   */
  stat(options?: HTTPRPCOptions): Promise<BitswapStats>

  /**
   * Returns the wantlist for your node
   *
   * @example
   * ```js
   * const list = await ipfs.bitswap.wantlist()
   * console.log(list)
   * // [ CID('QmHash') ]
   * ```
   */
  wantlist(options?: HTTPRPCOptions): Promise<CID[]>

  /**
   * Returns the wantlist for a connected peer
   *
   * @example
   * ```js
   * const list = await ipfs.bitswap.wantlistForPeer(peerId)
   * console.log(list)
   * // [ CID('QmHash') ]
   * ```
   */
  wantlistForPeer(peerId: PeerId, options?: HTTPRPCOptions): Promise<CID[]>
}

export function createBitswap (client: HTTPRPCClient): BitswapAPI {
  return {
    /**
     * TODO: https://github.com/ipfs/js-kubo-rpc-client/issues/99
     */
    wantlist: createWantlist(client),
    wantlistForPeer: createWantlistForPeer(client),
    stat: createStat(client)
  }
}

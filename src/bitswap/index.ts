import { createWantlist } from './wantlist.js'
import { createStat } from './stat.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { CID } from 'multiformats'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createBitswap (client: Client): BitswapAPI {
  // TODO: https://github.com/ipfs/js-kubo-rpc-client/issues/99
  return {
    wantlist: createWantlist(client),
    stat: createStat(client)
  }
}

export interface WantlistOptions extends ClientOptions {
  peer: PeerId
}

export interface BitswapAPI {
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
  wantlist: (options?: WantlistOptions) => Promise<CID[]>

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
  stat: (options?: ClientOptions) => Promise<Stats>
}

export interface Stats {
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

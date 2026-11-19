import { createLedger } from './ledger.ts'
import { createReprovide } from './reprovide.ts'
import { createStat } from './stat.ts'
import { createWantlistForPeer } from './wantlist-for-peer.ts'
import { createWantlist } from './wantlist.ts'
import type { HTTPRPCOptions } from '../index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'
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

export interface BitswapLedger {
  peer: PeerId
  value: number
  sent: bigint
  recv: bigint
  exchanged: bigint
}

export interface BitswapWantlistOptions extends HTTPRPCOptions {
  /**
   * Return this peer's wantlist instead of the local node's wantlist.
   */
  peer?: PeerId
}

export interface BitswapAPI {
  /**
   * Show the current Bitswap ledger for a peer. Byte and exchange counters
   * are bigints so uint64 values can be represented without precision loss.
   */
  ledger(peerId: PeerId, options?: HTTPRPCOptions): Promise<BitswapLedger>

  /**
   * Announce locally stored content again.
   *
   * @deprecated Kubo deprecates this RPC in favor of routing/reprovide.
   */
  reprovide(options?: HTTPRPCOptions): Promise<void>

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
  wantlist(options?: BitswapWantlistOptions): Promise<CID[]>

  /**
   * Returns the wantlist for a connected peer
   *
   * @deprecated Use `bitswap.wantlist({ peer: peerId })` instead.
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
    ledger: createLedger(client),
    reprovide: createReprovide(client),
    wantlist: createWantlist(client),
    wantlistForPeer: createWantlistForPeer(client),
    stat: createStat(client)
  }
}

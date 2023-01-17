import { createStat as createRepo } from '../repo/stat.js'
import { createStat as createBitswap } from '../bitswap/stat.js'
import { createBw } from './bw.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { BitswapAPI } from '../bitswap/index.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'
import type { RepoAPI } from '../repo/index.js'

export function createStats (client: Client): StatsAPI {
  return {
    bitswap: createBitswap(client),
    repo: createRepo(client),
    bw: createBw(client)
  }
}

export interface StatsAPI {
  bitswap: BitswapAPI['stat']
  repo: RepoAPI['stat']

  /**
   * Return bandwith usage stats
   */
  bw: (options?: BWOptions) => AsyncIterable<BWResult>
}

export interface BWOptions extends ClientOptions {
  /**
   * Specifies a peer to print bandwidth for
   */
  peer?: PeerId

  /**
   * Specifies a protocol to print bandwidth for
   */
  proto?: string

  /**
   * Is used to yield bandwidth info at an interval
   */
  poll?: boolean

  /**
   * The time interval to wait between updating output, if `poll` is `true`.
   */
  interval?: number | string
}

export interface BWResult {
  totalIn: bigint
  totalOut: bigint
  rateIn: number
  rateOut: number
}

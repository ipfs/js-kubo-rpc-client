import { createStat as createBitswap } from '../bitswap/stat.ts'
import { createStat as createRepo } from '../repo/stat.ts'
import { createBw } from './bw.ts'
import type { BitswapAPI } from '../bitswap/index.ts'
import type { HTTPRPCOptions } from '../index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'
import type { RepoAPI } from '../repo/index.ts'
import type { PeerId } from '@libp2p/interface'

export interface StatsAPI {
  bitswap: BitswapAPI['stat']
  repo: RepoAPI['stat']

  /**
   * Return bandwith usage stats
   */
  bw(options?: StatsBWOptions): AsyncIterable<StatsBWResult>
}

export interface StatsBWOptions extends HTTPRPCOptions {
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

export interface StatsBWResult {
  totalIn: bigint
  totalOut: bigint
  rateIn: number
  rateOut: number
}

export function createStats (client: HTTPRPCClient): StatsAPI {
  return {
    bitswap: createBitswap(client),
    repo: createRepo(client),
    bw: createBw(client)
  }
}

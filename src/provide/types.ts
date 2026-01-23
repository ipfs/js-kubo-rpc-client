import type { HTTPRPCOptions } from '../index.js'

/**
 * Options for `ipfs.provide.stat`.
 */
export interface ProvideStatOptions extends HTTPRPCOptions {
  /**
   * Return all statistics (recommended).
   */
  all?: boolean

  /**
   * Return LAN-specific statistics.
   */
  lan?: boolean
}

/**
 * Response returned by the Kubo RPC endpoint:
 * /api/v0/provide/stat
 *
 * Depending on the provider system in use, either `Sweep`
 * or `Legacy` statistics will be populated.
 */
export interface ProvideStats {
  /**
   * Stats for the sweep provider (default in modern Kubo).
   */
  Sweep?: SweepProvideStats

  /**
   * Stats for the legacy provider (deprecated).
   * Present only when legacy provider is enabled.
   */
  Legacy?: LegacyProvideStats | null

  /**
   * Whether the node is using Full Routing Table (FullRT) DHT.
   */
  FullRT?: boolean
}

/**
 * Sweep provider stats (modern provider system).
 */
export interface SweepProvideStats {
  closed: boolean
  connectivity: ProvideConnectivity
  queues: ProvideQueues
  schedule: ProvideSchedule
  workers: ProvideWorkers
  timing: ProvideTiming
  operations: ProvideOperations
  network: ProvideNetwork
}

/**
 * Legacy provider stats (older provider system).
 */
export interface LegacyProvideStats {
  total_reprovides: number
  avg_reprovide_duration: string
  last_reprovide_duration: string
  last_run?: string
  reprovide_interval?: string
}

/**
 * Connectivity status of the provider to the DHT.
 */
export interface ProvideConnectivity {
  status: string
  since: string
}

/**
 * Pending provide and reprovide queue sizes.
 */
export interface ProvideQueues {
  pending_key_provides: number
  pending_region_provides: number
  pending_region_reprovides: number
}

/**
 * Scheduling information for reprovides.
 */
export interface ProvideSchedule {
  keys: number
  regions: number
  avg_prefix_length: number
  next_reprovide_at: string
  next_reprovide_prefix: string
}

/**
 * Worker pool state for provider operations.
 */
export interface ProvideWorkers {
  max: number
  active: number
  active_periodic: number
  active_burst: number
  dedicated_periodic: number
  dedicated_burst: number
  queued_periodic: number
  queued_burst: number
  max_provide_conns_per_worker: number
}

/**
 * Timing and lifecycle information for the provider.
 */
export interface ProvideTiming {
  uptime: number
  reprovides_interval: number
  cycle_start: string
  current_time_offset: number
  max_reprovide_delay: number
}

/**
 * Ongoing and historical provide operations.
 */
export interface ProvideOperations {
  ongoing: {
    key_provides: number
    region_provides: number
    key_reprovides: number
    region_reprovides: number
  }
  past: {
    keys_provided: number
    records_provided: number
    keys_failed: number
    keys_provided_per_minute?: number
    keys_reprovided_per_minute?: number
    reprovide_duration?: number
    avg_keys_per_reprovide?: number
    regions_reprovided_last_cycle?: number
  }
}

/**
 * DHT and network-related provider metrics.
 */
export interface ProvideNetwork {
  peers: number
  reachable: number
  complete_keyspace_coverage: boolean
  avg_region_size: number
  avg_holders: number
  replication_factor: number
}

import { createGetAll } from './get-all.js'
import { createGet } from './get.js'
import { createProfiles, type ConfigProfilesAPI } from './profiles/index.js'
import { createReplace } from './replace.js'
import { createSet } from './set.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export interface Config {
  Addresses?: AddressConfig
  API?: APIConfig
  Profiles?: string
  Bootstrap?: string[]
  Discovery?: DiscoveryConfig
  Datastore?: DatastoreConfig
  Identity?: IdentityConfig
  Keychain?: KeychainConfig
  Pubsub?: PubsubConfig
  Swarm?: SwarmConfig
  Routing?: RoutingConfig
}

/**
 * Contains information about various listener addresses to be used by this node
 */
export interface AddressConfig {
  API?: string
  RPC?: string
  Delegates?: string[]
  Gateway?: string
  Swarm?: string[]
  Announce?: string[]
  NoAnnounce?: string[]
}

export interface APIConfig {
  HTTPHeaders?: Record<string, string[]>
}

export interface DiscoveryConfig {
  MDNS?: MDNSDiscovery
  webRTCStar?: WebRTCStarDiscovery
}

export interface MDNSDiscovery {
  Enabled?: boolean
  Interval?: number
}

export interface WebRTCStarDiscovery {
  Enabled?: boolean
}

export interface DatastoreConfig {
  Spec?: DatastoreSpec
}

export interface DatastoreType {
  type: string
  path: string
  sync?: boolean
  shardFunc?: string
  compression?: string
}

export interface DatastoreMountPoint {
  mountpoint: string
  type: string
  prefix: string
  child: DatastoreType
}

export interface DatastoreSpec {
  type?: string
  mounts?: DatastoreMountPoint[]
}

export interface IdentityConfig {
  /**
   * The unique PKI identity label for this configs peer. Set on init and never
   * read, its merely here for convenience. IPFS will always generate the peerID
   * from its keypair at runtime.
   */
  PeerID: string

  /**
   * The base64 encoded protobuf describing (and containing) the nodes private key.
   */
  PrivKey: string
}

export interface KeychainConfig {
  DEK?: DEK
}

export interface DEK {
  keyLength?: number
  iterationCount?: number
  salt?: string
  hash?: string
}

export interface PubsubConfig {
  PubSubRouter?: 'gossipsub' | 'floodsub'
  Enabled?: boolean
}

export interface SwarmConfig {
  ConnMgr?: ConnMgrConfig
  DisableNatPortMap?: boolean
}

export interface ConnMgrConfig {
  LowWater?: number
  HighWater?: number
}

export interface RoutingConfig {
  Type?: string
}

export interface ConfigAPI {
  /**
   * Returns a value from the currently being used config. If the daemon
   * is off, it returns the value from the stored config.
   */
  get(key: string, options?: HTTPRPCOptions): Promise<string | Record<string, any>>

  /**
   * Returns the full config been used. If the daemon is off, it returns the
   * stored config
   */
  getAll(options?: HTTPRPCOptions): Promise<Config>

  /**
   * Adds or replaces a config value. Note that restarting the node will be
   * necessary for any change to take effect.
   */
  set(key: string, value: any, options?: HTTPRPCOptions): Promise<void>

  /**
   * Replaces the full config. Note that restarting the node will be
   * necessary for any change to take effect.
   */
  replace(config: Config, options?: HTTPRPCOptions): Promise<void>

  profiles: ConfigProfilesAPI
}

export function createConfig (client: HTTPRPCClient): ConfigAPI {
  return {
    getAll: createGetAll(client),
    get: createGet(client),
    set: createSet(client),
    replace: createReplace(client),
    profiles: createProfiles(client)
  }
}

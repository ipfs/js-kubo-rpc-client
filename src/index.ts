/* eslint-env browser */

import { isMultiaddr, type Multiaddr } from '@multiformats/multiaddr'
import { createKuboRPCClient } from './client.js'
import { HTTP } from './lib/http.js'
import type { BitswapAPI } from './bitswap/index.js'
import type { BlockAPI } from './block/index.js'
import type { BootstrapAPI } from './bootstrap/index.js'
import type { ConfigAPI } from './config/index.js'
import type { DAGAPI } from './dag/index.js'
import type { DHTAPI } from './dht/index.js'
import type { DiagAPI } from './diag/index.js'
import type { FilesAPI } from './files/index.js'
import type { KeyAPI } from './key/index.js'
import type { HTTPOptions } from './lib/http.js'
import type { LoadBaseFn } from './lib/multibases.js'
import type { LoadCodecFn } from './lib/multicodecs.js'
import type { LoadHasherFn } from './lib/multihashes.js'
import type { LogAPI } from './log/index.js'
import type { NameAPI } from './name/index.js'
import type { ObjectAPI } from './object/index.js'
import type { PinAPI } from './pin/index.js'
import type { PubSubAPI } from './pubsub/index.js'
import type { RefsAPI } from './refs/index.js'
import type { RepoAPI } from './repo/index.js'
import type { RoutingAPI } from './routing/index.js'
import type { StatsAPI } from './stats/index.js'
import type { SwarmAPI } from './swarm/index.js'
import type { AbortOptions, PeerId } from '@libp2p/interface'
import type { Mtime, MtimeLike } from 'ipfs-unixfs'
import type { MultibaseCodec } from 'multiformats/bases/interface'
import type { CID, Version } from 'multiformats/cid'
import type { BlockCodec } from 'multiformats/codecs/interface'
import type { MultihashHasher } from 'multiformats/hashes/interface'
import type { Agent as HttpAgent } from 'node:http'
import type { Agent as HttpsAgent } from 'node:https'

export type Await<T> = T | Promise<T>
export type AwaitIterable<T> = Iterable<T> | AsyncIterable<T>

export interface HTTPRPCOptions extends AbortOptions {
  headers?: Headers | Record<string, any>
  searchParams?: URLSearchParams
  timeout?: number | string
  verbose?: boolean
}

export interface Bases {
  getBase(code: string): Promise<MultibaseCodec<any>>
  listBases(): Array<MultibaseCodec<any>>
}

export interface Codecs {
  getCodec(code: number | string): Promise<BlockCodec<any, any>>
  listCodecs(): Array<BlockCodec<any, any>>
}

export interface Hashers {
  getHasher(code: number | string): Promise<MultihashHasher>
  listHashers(): MultihashHasher[]
}

/**
 * Tracks progress status as a file is transformed into a DAG
 */
export interface AddProgressFn { (bytes: number, path?: string): void }

interface ProgressStatus {
  total: number
  loaded: number
  lengthComputable: boolean
}

/**
 * Tracks progress status as a file is uploaded to the RPC server
 */
export interface UploadProgressFn { (status: ProgressStatus): void }

export interface EndpointConfig {
  host: string
  port: string
  protocol: string
  pathname: string
  'api-path': string
}

export interface IPFSEntry {
  readonly type: 'dir' | 'file'
  readonly cid: CID
  readonly name: string
  readonly path: string
  mode?: number
  mtime?: Mtime
  size: number
}

export interface AddOptions extends HTTPRPCOptions {
  /**
   * Chunking algorithm used to build ipfs DAGs. (defaults to 'size-262144')
   */
  chunker?: string
  /**
   * The CID version to use when storing the data
   */
  cidVersion?: Version

  /**
   * Multihash hashing algorithm to use. (Defaults to 'sha2-256')
   */
  hashAlg?: string

  /**
   * If true, will not add blocks to the blockstore. (Defaults to `false`)
   */
  onlyHash?: boolean

  /**
   * Pin this object when adding. (Defaults to `true`)
   */
  pin?: boolean

  /**
   * A function that will be called with the number of bytes added as a file is
   * added to ipfs and the path of the file being added.
   *
   * **Note** It will not be called for directory entries.
   */
  progress?: AddProgressFn

  /**
   * If true, DAG leaves will contain raw file data and not be wrapped in a
   * protobuf. (Defaults to `false`)
   */
  rawLeaves?: boolean

  /**
   * If true will use the
   * [trickle DAG](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle)
   * format for DAG generation. (Defaults to `false`).
   */
  trickle?: boolean

  /**
   * Adds a wrapping node around the content. (Defaults to `false`)
   */
  wrapWithDirectory?: boolean

  /**
   * Whether to preload all blocks created during this operation
   */
  preload?: boolean

  /**
   * How many blocks from a file to write concurrently
   */
  blockWriteConcurrency?: number
}

export interface AddAllOptions extends AddOptions {

  /**
   * Allows to create directories with an unlimited number of entries currently
   * size of unixfs directories is limited by the maximum block size.
   * ** Note ** that this is an experimental feature. (Defaults to `false`)
   */
  enableShardingExperiment?: boolean

  /**
   * Directories with more than this number of files will be created as HAMT -
   * sharded directories. (Defaults to 1000)
   */
  shardSplitThreshold?: number

  /**
   * How many files to write concurrently
   */
  fileImportConcurrency?: number
}

export interface AddResult {
  cid: CID
  size: number
  path: string
  mode?: number
  mtime?: Mtime
}

export interface ShardingOptions {
  sharding?: boolean
}

export interface CatOptions extends HTTPRPCOptions {
  /**
   * An offset to start reading the file from
   */
  offset?: number
  /**
   * An optional max length to read from the file
   */
  length?: number
}

export interface GetOptions extends HTTPRPCOptions {
  archive?: boolean
  compress?: boolean
  compressionLevel?: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
}

export interface ListOptions extends HTTPRPCOptions {

}

export interface IDOptions extends HTTPRPCOptions {
  peerId?: PeerId
}

export interface IDResult {
  id: PeerId
  publicKey: string
  addresses: Multiaddr[]
  agentVersion: string
  protocolVersion: string
  protocols: string[]
}

/**
 * An object with the version information for the implementation,
 * the commit and the Repo. `js-ipfs` instances will also return
 * the version of `interface-ipfs-core` and `ipfs-http-client`
 * supported by this node
 */
export interface VersionResult {
  version: string
  commit?: string
  repo?: string
  system?: string
  golang?: string
  'ipfs-core'?: string
  'interface-ipfs-core'?: string
  'ipfs-http-client'?: string
}

export interface PingOptions extends HTTPRPCOptions {
  count?: number
}

export interface PingResult {
  success: boolean
  time: number
  text: string
}

export interface ResolveOptions extends HTTPRPCOptions {
  recursive?: boolean
  cidBase?: string
}

export interface MountOptions extends HTTPRPCOptions {
  ipfsPath?: string
  ipnsPath?: string
}

export interface MountResult {
  fuseAllowOther?: boolean
  ipfs?: string
  ipns?: string
}

export type ImportCandidateStream =
| AwaitIterable<ImportCandidate>
| ReadableStream<ImportCandidate>

export type ImportCandidate =
  | ToFile
  | ToDirectory
  | ToContent

export interface ToFile extends ToFileMetadata {
  path?: string
  content: ToContent
}

export interface ToDirectory extends ToFileMetadata {
  path: string
  content?: undefined
}

export interface ToFileMetadata {
  mode?: ToMode
  mtime?: MtimeLike
}

/**
 * An IPFS path or CID
 */
export type IPFSPath = CID | string

/**
 * File content in arbitrary (supported) representation. It is used in input
 * positions and is usually normalized to `Blob` in browser contexts and
 * `AsyncIterable<Uint8Array>` in node.
 */
export type ToContent =
  | string
  | InstanceType<typeof String>
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | AwaitIterable<Uint8Array>
  | ReadableStream<Uint8Array>

export type ToMode =
  | string
  | number

export interface KuboRPCClient {
  bases: Bases
  codecs: Codecs
  hashers: Hashers
  bitswap: BitswapAPI
  block: BlockAPI
  bootstrap: BootstrapAPI
  config: ConfigAPI
  dag: DAGAPI
  dht: DHTAPI
  diag: DiagAPI
  files: FilesAPI
  key: KeyAPI
  log: LogAPI
  name: NameAPI
  object: ObjectAPI
  pin: PinAPI
  pubsub: PubSubAPI
  refs: RefsAPI
  repo: RepoAPI
  routing: RoutingAPI
  stats: StatsAPI
  swarm: SwarmAPI

  /**
   * Import a file or data into IPFS
   */
  add(entry: ImportCandidate, options?: AddOptions): Promise<AddResult>

  /**
   * Import multiple files and data into IPFS
   */
  addAll(source: ImportCandidateStream, options?: AddAllOptions): AsyncIterable<AddResult>

  /**
   * Returns content of the file addressed by a valid IPFS Path or CID
   */
  cat(ipfsPath: IPFSPath, options?: CatOptions): AsyncIterable<Uint8Array>

  /**
   * Fetch a file or an entire directory tree from IPFS that is addressed by a
   * valid IPFS Path
   */
  get(ipfsPath: IPFSPath, options?: GetOptions): AsyncIterable<Uint8Array>

  /**
   * Lists a directory from IPFS that is addressed by a valid IPFS Path
   */
  ls(ipfsPath: IPFSPath, options?: ListOptions): AsyncIterable<IPFSEntry>

  /**
   * Returns the identity of the Peer
   *
   * @example
   * ```js
   * const identity = await ipfs.id()
   * console.log(identity)
   * ```
   */
  id(options?: IDOptions): Promise<IDResult>

  /**
   * Returns the implementation version
   *
   * @example
   * ```js
   * const version = await ipfs.version()
   * console.log(version)
   * ```
   */
  version(options?: HTTPRPCOptions): Promise<VersionResult>

  /**
   * Stop the node
   */
  stop(options?: HTTPRPCOptions): Promise<void>

  /**
   * Send echo request packets to IPFS hosts.
   *
   * @example
   * ```js
   * for await (const res of ipfs.ping('Qmhash')) {
   *   if (res.time) {
   *     console.log(`Pong received: time=${res.time} ms`)
   *   } else {
   *     console.log(res.text)
   *   }
   * }
   * ```
   */
  ping(peerId: PeerId | string, options?: PingOptions): AsyncIterable<PingResult>

  /**
   * Resolve the value of names to IPFS
   *
   * There are a number of mutable name protocols that can link among themselves
   * and into IPNS. For example IPNS references can (currently) point at an IPFS
   * object, and DNS links can point at other DNS links, IPNS entries, or IPFS
   * objects. This command accepts any of these identifiers and resolves them
   * to the referenced item.
   *
   * @example
   * ```js
   * // Resolve the value of your identity:
   * const name = '/ipns/QmatmE9msSfkKxoffpHwNLNKgwZG8eT9Bud6YoPab52vpy'
   *
   * const res = await ipfs.resolve(name)
   * console.log(res)
   * // Logs: /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
   *
   * // Resolve the value of another name recursively:
   * const name = '/ipns/QmbCMUZw6JFeZ7Wp9jkzbye3Fzp2GGcPgC3nmeUjfVF87n'
   *
   * // Where:
   * // /ipns/QmbCMUZw6JFeZ7Wp9jkzbye3Fzp2GGcPgC3nmeUjfVF87n
   * // ...resolves to:
   * // /ipns/QmatmE9msSfkKxoffpHwNLNKgwZG8eT9Bud6YoPab52vpy
   * // ...which in turn resolves to:
   * // /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
   *
   * const res = await ipfs.resolve(name, { recursive: true })
   * console.log(res)
   * // Logs: /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
   *
   * // Resolve the value of an IPFS path:
   * const name = '/ipfs/QmeZy1fGbwgVSrqbfh9fKQrAWgeyRnj7h8fsHS1oy3k99x/beep/boop'
   * const res = await ipfs.resolve(name)
   * console.log(res)
   * // Logs: /ipfs/QmYRMjyvAiHKN9UTi8Bzt1HUspmSRD8T8DwxfSMzLgBon1
   * ```
   */
  resolve(name: string, options?: ResolveOptions): Promise<string>

  /**
   * Returns a list of available commands
   */
  commands(options?: HTTPRPCOptions): Promise<string[]>

  mount(options?: MountOptions): Promise<MountResult>

  /**
   * Returns true if this IPFS node is online - that is, it's listening on network addresses
   * for incoming connections
   */
  isOnline(): Promise<boolean>

  getEndpointConfig(): EndpointConfig
}

export interface Options {
  host?: string
  port?: number | string
  protocol?: string
  headers?: Headers | Record<string, string>
  timeout?: number | string
  apiPath?: string
  url?: URL | string | Multiaddr
  ipld?: Partial<IPLDOptions>
  agent?: HttpAgent | HttpsAgent
}

export interface IPLDOptions {
  loadBase: LoadBaseFn
  loadCodec: LoadCodecFn
  loadHasher: LoadHasherFn
  bases: Array<MultibaseCodec<any>>
  codecs: Array<BlockCodec<any, any>>
  hashers: MultihashHasher[]
}

export function create (options: string | Multiaddr | URL | Options = {}): KuboRPCClient {
  if (typeof options === 'string' || isMultiaddr(options) || options instanceof URL) {
    options = {
      url: options
    }
  }

  return createKuboRPCClient(options)
}

export { create as createKuboRPCClient }
export { CID } from 'multiformats/cid'
export { multiaddr } from '@multiformats/multiaddr'
export * from './lib/glob-source.js'

export interface UrlSourceEntry {
  path: string
  content?: AsyncIterable<Uint8Array>
}

export function urlSource (url: string, options?: HTTPOptions): UrlSourceEntry {
  return {
    path: decodeURIComponent(new URL(url).pathname.split('/').pop() ?? ''),
    content: readURLContent(url, options)
  }
}

export async function * readURLContent (url: string, options?: HTTPOptions): AsyncIterable<Uint8Array> {
  const response = await HTTP.get(url, options)

  yield * response.iterator()
}

export * from './bitswap/index.js'
export * from './block/index.js'
export * from './bootstrap/index.js'
export * from './config/index.js'
export * from './dag/index.js'
export * from './dht/index.js'
export * from './diag/index.js'
export * from './files/index.js'
export * from './key/index.js'
export * from './log/index.js'
export * from './name/index.js'
export * from './object/index.js'
export * from './pin/index.js'
export * from './pubsub/index.js'
export * from './refs/index.js'
export * from './repo/index.js'
export * from './routing/index.js'
export * from './stats/index.js'
export * from './swarm/index.js'

/* eslint-disable etc/prefer-interface */
/* eslint-env browser */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { Multibases } from 'ipfs-core-utils/multibases'
import { Multicodecs } from 'ipfs-core-utils/multicodecs'
import { Multihashes } from 'ipfs-core-utils/multihashes'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import * as dagJSON from '@ipld/dag-json'
import * as dagJOSE from 'dag-jose'
import { identity } from 'multiformats/hashes/identity'
import { bases, hashes, codecs, CID } from 'multiformats/basics'
import { BitswapAPI, createBitswap } from './bitswap/index.js'
import { BlockAPI, createBlock } from './block/index.js'
import { BootstrapAPI, createBootstrap } from './bootstrap/index.js'
import { ConfigAPI, createConfig } from './config/index.js'
import { createDag, DagAPI } from './dag/index.js'
import { createDht, DhtAPI } from './dht/index.js'
import { createDiag, DiagAPI } from './diag/index.js'
import { createFiles, FilesAPI } from './files/index.js'
import { createKey, KeyAPI } from './key/index.js'
import { createLog, LogAPI } from './log/index.js'
import { createName, NameAPI } from './name/index.js'
import { createObject, ObjectAPI } from './object/index.js'
import { createPin, PinAPI } from './pin/index.js'
import { createPubsub, PubsubAPI } from './pubsub/index.js'
import { createRefs, RefsAPI } from './refs/index.js'
import { createRepo, RepoAPI } from './repo/index.js'
import { createRouting, RoutingAPI } from './routing/index.js'
import { createStats, StatsAPI } from './stats/index.js'
import { createSwarm, SwarmAPI } from './swarm/index.js'
import globSourceImport from 'ipfs-utils/src/files/glob-source.js'
import { Client } from './lib/core.js'
import { createRoot, RootAPI } from './root.js'
import type { Agent as HttpAgent } from 'http'
import type { Agent as HttpsAgent } from 'https'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { Message } from '@libp2p/interface-pubsub'
import type { MultihashHasher } from 'multiformats/hashes/interface'
import type { MtimeLike } from 'ipfs-unixfs'

export function create (options: Options|URL|Multiaddr|string = {}): KuboClient {
  if (typeof options === 'string') {
    options = { url: options }
  }

  const id: BlockCodec = {
    name: identity.name,
    code: identity.code,
    encode: (id) => id,
    decode: (id) => id
  }

  const ipld: Partial<IPLDOptions> | undefined = 'ipld' in options ? options.ipld : {}
  const multibaseCodecs: MultibaseCodec[] = Object.values(bases);

  (ipld?.bases ?? []).forEach(base => multibaseCodecs.push(base))

  const multibases = new Multibases({
    bases: multibaseCodecs,
    loadBase: ipld?.loadBase
  })

  const blockCodecs: BlockCodec[] = Object.values(codecs);

  [dagPB, dagCBOR, dagJSON, dagJOSE, id].concat(ipld?.codecs ?? []).forEach(codec => blockCodecs.push(codec))

  const multicodecs = new Multicodecs({
    codecs: blockCodecs,
    loadCodec: ipld?.loadCodec
  })

  const multihashHashers: MultihashHasher[] = Object.values(hashes);

  (ipld?.hashers ?? []).forEach(hasher => multihashHashers.push(hasher))

  const multihashes = new Multihashes({
    hashers: multihashHashers,
    loadHasher: ipld?.loadHasher
  })

  const httpClient = new Client(options)

  const rpcClient: KuboClient = {
    ...createRoot(httpClient),
    bitswap: createBitswap(httpClient),
    block: createBlock(httpClient),
    bootstrap: createBootstrap(httpClient),
    config: createConfig(httpClient),
    dag: createDag(multicodecs, httpClient),
    dht: createDht(httpClient),
    diag: createDiag(httpClient),
    files: createFiles(httpClient),
    key: createKey(httpClient),
    log: createLog(httpClient),
    name: createName(httpClient),
    object: createObject(multicodecs, httpClient),
    pin: createPin(httpClient),
    pubsub: createPubsub(httpClient),
    refs: createRefs(httpClient),
    repo: createRepo(httpClient),
    routing: createRouting(httpClient),
    stats: createStats(httpClient),
    swarm: createSwarm(httpClient),
    bases: multibases,
    codecs: multicodecs,
    hashers: multihashes
  }

  return rpcClient
}

/**
 * Represents a value that you can await on, which is either value or a promise
 * of one.
 */
export type Await<T> =
  | T
  | Promise<T>

/**
 * Represents an iterable that can be used in `for await` loops, that is either
 * iterable or an async iterable.
 */
export type AwaitIterable<T> =
  | Iterable<T>
  | AsyncIterable<T>

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

/**
 * An IPFS path or CID
 */
export type IPFSPath = CID | string

export type { Multicodecs } from 'ipfs-core-utils/multicodecs'
export type { HTTPOptions, ProgressFn as IPFSUtilsHttpUploadProgressFn, ExtendedResponse } from 'ipfs-utils/src/types'

export type BlockCodec<T1 = any, T2 = any> = import('multiformats/codecs/interface').BlockCodec<T1, T2>
export type MessageHandlerFn<EventType = Message> = import('@libp2p/interfaces/events').EventHandler<EventType>
export type PubsubApiErrorHandlerFn = (err: Error, fatal: boolean, msg?: Message) => void

export type MultibaseCodec<Prefix extends string = any> = import('multiformats/bases/interface').MultibaseCodec<Prefix>
export type { Message, MultihashHasher, Multiaddr }

export { CID } from 'multiformats/cid'
export { multiaddr } from '@multiformats/multiaddr'
export { default as urlSource } from 'ipfs-utils/src/files/url-source.js'
export const globSource = globSourceImport

export interface LoadBaseFn { (codeOrName: number | string): Promise<MultibaseCodec<any>> }
export interface LoadCodecFn { (codeOrName: number | string): Promise<BlockCodec<any, any>> }
export interface LoadHasherFn { (codeOrName: number | string): Promise<MultihashHasher> }

export interface IPLDOptions {
  loadBase: LoadBaseFn
  loadCodec: LoadCodecFn
  loadHasher: LoadHasherFn
  bases: Array<MultibaseCodec<any>>
  codecs: Array<BlockCodec<any, any>>
  hashers: MultihashHasher[]
}

export interface Options {
  host?: string
  port?: string|number
  protocol?: string
  headers?: Headers | Record<string, string>
  timeout?: number | string
  apiPath?: string
  url?: URL | string | Multiaddr
  ipld?: Partial<IPLDOptions>
  agent?: HttpAgent | HttpsAgent
  signal?: AbortSignal
}

export interface EndpointConfig {
  host: string
  port: string
  protocol: string
  pathname: string
  'api-path': string
}

export interface KuboClient extends RootAPI {
  bitswap: BitswapAPI
  block: BlockAPI
  bootstrap: BootstrapAPI
  config: ConfigAPI
  dag: DagAPI
  dht: DhtAPI
  diag: DiagAPI
  files: FilesAPI
  key: KeyAPI
  log: LogAPI
  name: NameAPI
  object: ObjectAPI
  pin: PinAPI
  pubsub: PubsubAPI
  refs: RefsAPI
  repo: RepoAPI
  routing: RoutingAPI
  stats: StatsAPI
  swarm: SwarmAPI
  bases: Multibases
  codecs: Multicodecs
  hashers: Multihashes
}

export interface PreloadOptions {
  preload?: boolean
}

export interface AbortOptions {
  /**
   * Can be provided to a function that starts a long running task, which will
   * be aborted when signal is triggered.
   */
  signal?: AbortSignal
  /**
   * Can be provided to a function that starts a long running task, which will
   * be aborted after provided timeout (in ms).
   */
  timeout?: number
}

export interface ClientOptions extends AbortOptions {
  headers?: Record<string, string>
  searchParams?: URLSearchParams
}

export type PubsubSubscription = {
  handler: MessageHandlerFn
  controller: AbortController
}

export interface SubscribeMessage {
  from: import('ipfsd-ctl').Controller['peer']
  type: string
  data: Uint8Array
  sequenceNumber: BigInt
  topic: string
  key: Uint8Array
  signature: Uint8Array
}

/* eslint-disable etc/prefer-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { Agent as HttpAgent } from 'http'
import type { Agent as HttpsAgent } from 'https'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { MultihashHasher } from 'multiformats/hashes/interface'
import type { IPFS } from 'ipfs-core-types'
import type { Message } from '@libp2p/interface-pubsub'
import type IpfsUtilsHttp from 'ipfs-utils/src/http.js'

export interface Options {
  host?: string
  port?: number
  protocol?: string
  headers?: Headers | Record<string, string>
  timeout?: number | string
  apiPath?: string
  url?: URL | string | Multiaddr
  ipld?: Partial<IPLDOptions>
  agent?: HttpAgent | HttpsAgent
}

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

export interface HTTPClientExtraOptions {
  headers?: Record<string, string>
  searchParams?: URLSearchParams
  // pubsub: IPFS<HTTPClientExtraOptions>['pubsub']
}

export interface EndpointConfig {
  host: string
  port: string
  protocol: string
  pathname: string
  'api-path': string
}

export interface IpfsUtilsHttpClient extends IpfsUtilsHttp {

}
type OldRpcClientConfigApi = IPFS<HTTPClientExtraOptions>['config']
interface KuboRpcClientConfigApi extends Omit<OldRpcClientConfigApi, 'profiles'> {
  profiles: Omit<OldRpcClientConfigApi['profiles'], 'list'>
}

export interface KuboRpcClientApi extends Omit<IPFS<HTTPClientExtraOptions>, 'files' | 'bitswap' | 'config' | 'bootstrap'> {
  bitswap: Omit<IPFS<HTTPClientExtraOptions>['bitswap'], 'unwant'>
  config: KuboRpcClientConfigApi
  files: Omit<IPFS<HTTPClientExtraOptions>['files'], 'chmod' | 'touch'>
  bootstrap: Omit<IPFS<HTTPClientExtraOptions>['bootstrap'], 'clear' | 'reset'>
}

export interface IPFSHTTPClient extends KuboRpcClientApi {
  getEndpointConfig: () => EndpointConfig
}

export type MapEventResponses = {
  ID: string
  Addrs: string[]
}

export type MapEvent = {
  Type: number
  ID: string
  Extra: string
  Responses: MapEventResponses[]
}

export type PubsubSubscription = {
  handler: MessageHandlerFn
  controller: AbortController
}
export type ConfigureFn<T> = (client: IpfsUtilsHttpClient, clientOptions: Options) => T
export type ConfigureFactory<T> = (clientOptions: Options) => T

export type { PeerInfo } from '@libp2p/interface-peer-info'
export type { IPFSEntry, AddResult, AddProgressFn as IPFSCoreAddProgressFn } from 'ipfs-core-types/src/root'
export type { GetResult } from 'ipfs-core-types/src/dag'
export type { IPFSPath, AbortOptions } from 'ipfs-core-types/src/utils'
export type { LsResult } from 'ipfs-core-types/src/pin'
export type { IPFS } from 'ipfs-core-types'
export type { Multicodecs } from 'ipfs-core-utils/multicodecs'
export type { QueryEvent } from 'ipfs-core-types/src/dht'
export type { Query, Status, Pin, AddOptions } from 'ipfs-core-types/src/pin/remote'
export type { RmResult } from 'ipfs-core-types/src/block'
export type { HTTPOptions, ProgressFn as IPFSUtilsHttpUploadProgressFn, ExtendedResponse } from 'ipfs-utils/src/types'
export type { CID } from 'multiformats/cid'
export type {
  RemotePinServiceWithStat,
  Stat
} from 'ipfs-core-types/src/pin/remote/service'
export type { PeerId } from '@libp2p/interface-peer-id'

export type BitswapAPI = import('ipfs-core-types/src/bitswap').API<HTTPClientExtraOptions>
export type BlockAPI = import('ipfs-core-types/src/block').API<HTTPClientExtraOptions>
export type BlockCodec<T1 = any, T2 = any> = import('multiformats/codecs/interface').BlockCodec<T1, T2>
export type BootstrapAPI = import('ipfs-core-types/src/bootstrap').API<HTTPClientExtraOptions>
export type ConfigAPI = import('ipfs-core-types/src/config').API<HTTPClientExtraOptions>
export type ConfigProfilesAPI = import('ipfs-core-types/src/config/profiles').API<HTTPClientExtraOptions>
export type DAGAPI = import('ipfs-core-types/src/dag').API<HTTPClientExtraOptions>
export type DHTAPI = import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>
export type DiagAPI = import('ipfs-core-types/src/diag').API<HTTPClientExtraOptions>
export type FilesAPI = import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>
export type KeyAPI = import('ipfs-core-types/src/key').API<HTTPClientExtraOptions>
export type LogAPI = import('ipfs-core-types/src/log').API<HTTPClientExtraOptions>
export type MessageHandlerFn<EventType = Message> = import('@libp2p/interfaces/events').EventHandler<EventType>
export type NameAPI = import('ipfs-core-types/src/name').API<HTTPClientExtraOptions>
export type NamePubsubAPI = import('ipfs-core-types/src/name/pubsub').API<HTTPClientExtraOptions>
export type ObjectAPI = import('ipfs-core-types/src/object').API<HTTPClientExtraOptions>
export type ObjectPatchAPI = import('ipfs-core-types/src/object/patch').API<HTTPClientExtraOptions>
export type PinAPI = import('ipfs-core-types/src/pin').API<HTTPClientExtraOptions>
export type PubsubApiErrorHandlerFn = (err: Error, fatal: boolean, msg?: Message) => void
export type PubsubAPI = import('ipfs-core-types/src/pubsub').API<HTTPClientExtraOptions & { onError?: PubsubApiErrorHandlerFn }>
export type RefsAPI = import('ipfs-core-types/src/refs').API<HTTPClientExtraOptions>
export type RemotePiningAPI = import('ipfs-core-types/src/pin/remote').API<HTTPClientExtraOptions>
export type RemotePiningServiceAPI = import('ipfs-core-types/src/pin/remote/service').API<HTTPClientExtraOptions>
export type RepoAPI = import('ipfs-core-types/src/repo').API<HTTPClientExtraOptions>
export type RootAPI = import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>
export type StatsAPI = import('ipfs-core-types/src/stats').API<HTTPClientExtraOptions>
export type SwarmAPI = import('ipfs-core-types/src/swarm').API<HTTPClientExtraOptions>

export type MultibaseCodec<Prefix extends string = any> = import('multiformats/bases/interface').MultibaseCodec<Prefix>
export type { Message, MultihashHasher, Multiaddr }

export interface SubscribeMessage {
  from: import('ipfsd-ctl').Controller['peer']
  type: string
  data: Uint8Array
  sequenceNumber: BigInt
  topic: string
  key: Uint8Array
  signature: Uint8Array
}

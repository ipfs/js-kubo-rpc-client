import { createPublish } from './publish.js'
import { createPubsub, type NamePubSubAPI } from './pubsub/index.js'
import { createResolve } from './resolve.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { PeerId } from '@libp2p/interface'
import type { CID } from 'multiformats/cid'

export interface NamePublishOptions extends HTTPRPCOptions {
  /**
   * Resolve given path before publishing
   */
  resolve?: boolean
  /**
   * Time duration of the record
   */
  lifetime?: string
  /**
   * Time duration this record should be cached
   */
  ttl?: string
  /**
   * Name of the key to be used
   */
  key?: string
  /**
   * When offline, save the IPNS record
   * to the the local datastore without broadcasting to the network instead of
   * simply failing.
   *
   * This option is not yet implemented in js-ipfs. See tracking issue [ipfs/js-ipfs#1997]
   * (https://github.com/ipfs/js-ipfs/issues/1997).
   */
  allowOffline?: boolean
}

export interface NamePublishResult {
  /**
   * The published IPNS name
   */
  name: string

  /**
   * The IPNS record
   */
  value: string
}

export interface NameResolveOptions extends HTTPRPCOptions {
  /**
   * resolve until the result is not an IPNS name
   */
  recursive?: boolean

  /**
   * do not use cached entries
   */
  nocache?: boolean
}

export interface NameAPI {
  /**
   * IPNS is a PKI namespace, where names are the hashes of public keys, and
   * the private key enables publishing new (signed) values. In both publish
   * and resolve, the default name used is the node's own PeerID,
   * which is the hash of its public key.
   *
   * @example
   * ```js
   * // The address of your files.
   * const addr = '/ipfs/QmbezGequPwcsWo8UL4wDF6a8hYwM1hmbzYv2mnKkEWaUp'
   * const res = await ipfs.name.publish(addr)
   * // You now have a res which contains two fields:
   * //   - name: the name under which the content was published.
   * //   - value: the "real" address to which Name points.
   * console.log(`https://gateway.ipfs.io/ipns/${res.name}`)
   * ```
   */
  publish(value: CID | string, options?: NamePublishOptions): Promise<NamePublishResult>

  /**
   * Given a key, query the DHT for its best value.
   *
   * @example
   * ```js
   * // The IPNS address you want to resolve
   * const addr = '/ipns/ipfs.io'
   *
   * for await (const name of ipfs.name.resolve(addr)) {
   *   console.log(name)
   * }
   * // Logs: /ipfs/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm
   * ```
   */
  resolve(value: PeerId | string, options?: NameResolveOptions): AsyncIterable<string>

  pubsub: NamePubSubAPI
}

export function createName (client: HTTPRPCClient): NameAPI {
  return {
    publish: createPublish(client),
    resolve: createResolve(client),
    pubsub: createPubsub(client)
  }
}

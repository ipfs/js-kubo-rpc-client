import { createGet } from './get.js'
import { createPut } from './put.js'
import { createRm } from './rm.js'
import { createStat } from './stat.js'
import type { ClientOptions, PreloadOptions } from '../index.js'
import type { CID } from 'multiformats/cid'
import type { Client } from '../lib/core.js'

export function createBlock (client: Client): BlockAPI {
  return {
    get: createGet(client),
    put: createPut(client),
    rm: createRm(client),
    stat: createStat(client)
  }
}

export interface BlockAPI {
  /**
   * Get a raw IPFS block
   *
   * @example
   * ```js
   * const block = await ipfs.block.get(cid)
   * console.log(block)
   * ```
   */
  get: (cid: CID, options?: ClientOptions & PreloadOptions) => Promise<Uint8Array>

  /**
   * Stores a Uint8Array as a block in the underlying blockstore
   *
   * @example
   * ```js
   * import * as dagPB from '@ipld/dag-pb'
   * // Defaults
   * const encoder = new TextEncoder()
   * const decoder = new TextDecoder()
   *
   * const bytes = encoder.encode('a serialized object')
   * const cid = await ipfs.block.put(bytes)
   *
   * console.log(decoder.decode(block.data))
   * // Logs:
   * // a serialized object
   * console.log(block.cid.toString())
   * // Logs:
   * // the CID of the object
   * ```
   */
  put: (block: Uint8Array, options?: PutOptions) => Promise<CID>

  /**
   * Remove one or more IPFS block(s) from the underlying block store
   *
   * @example
   * ```js
   * for await (const result of ipfs.block.rm(cid)) {
   *   if (result.error) {
   *     console.error(`Failed to remove block ${result.cid} due to ${result.error.message}`)
   *   } else {
   *    console.log(`Removed block ${result.cid}`)
   *   }
   * }
   * ```
   */
  rm: (cid: CID | CID[], options?: RmOptions) => AsyncIterable<RmResult>

  /**
   * Print information of a raw IPFS block
   *
   * @example
   * ```js
   * const cid = CID.parse('QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ')
   * const stats = await ipfs.block.stat(cid)
   * console.log(stats.cid.toString())
   * // Logs: QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ
   * console.log(stat.size)
   * // Logs: 3739
   * ```
   */
  stat: (cid: CID, options?: ClientOptions & PreloadOptions) => Promise<StatResult>
}

export interface PutOptions extends ClientOptions, PreloadOptions {
  /**
   * Multicodec to use in returned CID. (Defaults to 'raw')
   */
  cidCodec?: string

  /**
   * Multihash hashing algorithm to use. (Defaults to 'sha2-256')
   */
  mhtype?: string

  /**
   * Multihash hash length. (Defaults to `-1`)
   */
  mhlen?: number

  /**
   * Pin this block when adding. (Defaults to `false`)
   */
  pin?: boolean

  /**
   * Disable block size check and allow creation of blocks larger than 1 MiB.
   * WARNING: such blocks won't be transferable over the standard bitswap.
   */
  allowBigBlock?: boolean

  /**
   * DEPRECATED: The codec to use to create the CID
   */
  format?: string
}

export interface RmOptions extends ClientOptions {
  /**
   * Ignores non-existent blocks
   */
  force?: boolean

  /**
   * Do not return output if true
   */
  quiet?: boolean
}

export interface RmResult {
  /**
   * The CID of the removed block
   */
  cid: CID

  /**
   * Any error that occurred while trying to remove the block
   */
  error?: Error
}

export interface StatResult {
  /**
   * The CID of the block
   */
  cid: CID

  /**
   * The size of the block
   */
  size: number
}

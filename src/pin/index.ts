import { createAddAll } from './add-all.js'
import { createAdd } from './add.js'
import { createLs } from './ls.js'
import { createRmAll } from './rm-all.js'
import { createRm } from './rm.js'
import { createRemote, PinRemoteAPI } from './remote/index.js'
import type { AwaitIterable, ClientOptions } from '../index.js'
import type { CID } from 'multiformats'
import type { Client } from '../lib/core.js'

export function createPin (client: Client): PinAPI {
  return {
    addAll: createAddAll(client),
    add: createAdd(client),
    ls: createLs(client),
    rmAll: createRmAll(client),
    rm: createRm(client),
    remote: createRemote(client)
  }
}

export interface PinAPI {
  /**
   * Adds an IPFS block to the pinset and also stores it to the IPFS
   * repo. pinset is the set of hashes currently pinned (not gc'able)
   *
   * @example
   * ```js
   * const cid = CID.parse('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * const pinned of ipfs.pin.add(cid))
   * console.log(pinned)
   * // Logs:
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  add: (cid: string | CID, options?: AddOptions) => Promise<CID>

  /**
   * Adds multiple IPFS blocks to the pinset and also stores it to the IPFS
   * repo. pinset is the set of hashes currently pinned (not gc'able)
   *
   * @example
   * ```js
   * const cid = CID.parse('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * for await (const cid of ipfs.pin.addAll([cid])) {
   *   console.log(cid)
   * }
   * // Logs:
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  addAll: (source: AwaitIterable<AddInput>, options?: AddAllOptions) => AsyncIterable<CID>

  /**
   * List all the objects pinned to local storage
   *
   * @example
   * ```js
   * for await (const { cid, type } of ipfs.pin.ls()) {
   *   console.log({ cid, type })
   * }
   * // { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
   * // { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
   * // { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
   *
   * const paths = [
   *   CID.parse('Qmc5..'),
   *   CID.parse('QmZb..'),
   *   CID.parse('QmSo..')
   * ]
   * for await (const { cid, type } of ipfs.pin.ls({ paths })) {
   *   console.log({ cid, type })
   * }
   * // { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
   * // { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
   * // { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
   * ```
   */
  ls: (options?: LsOptions) => AsyncIterable<LsResult>

  /**
   * Unpin this block from your repo
   *
   * @example
   * ```js
   * const cid = CID.parse('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * const result = await ipfs.pin.rm(cid)
   * console.log(result)
   * // prints the CID that was unpinned
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  rm: (ipfsPath: string | CID, options?: RmOptions) => Promise<CID>

  /**
   * Unpin one or more blocks from your repo
   *
   * @example
   * ```js
   * const source = [
   *   CID.parse('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ]
   * for await (const cid of ipfs.pin.rmAll(source)) {
   *   console.log(cid)
   * }
   * // prints the CIDs that were unpinned
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  rmAll: (source: AwaitIterable<RmAllInput>, options?: ClientOptions) => AsyncIterable<CID>

  remote: PinRemoteAPI
}

export interface AddOptions extends ClientOptions {
  /**
   * If true, pin all blocked linked to from the pinned CID
   */
  recursive?: boolean

  /**
   * Whether to preload all blocks pinned during this operation
   */
  preload?: boolean

  /**
   * Internal option used to control whether to create a repo write lock during a pinning operation
   */
  lock?: boolean
}

export interface AddAllOptions extends ClientOptions {
  /**
   * Whether to preload all blocks pinned during this operation
   */
  preload?: boolean

  /**
   * Internal option used to control whether to create a repo write lock during a pinning operation
   */
  lock?: boolean
}

export type AddInput = CID | AddInputWithOptions

export interface AddInputWithOptions {
  /**
   * A CID to pin - nb. you must pass either `cid` or `path`, not both
   */
  cid?: CID

  /**
   * An IPFS path to pin - nb. you must pass either `cid` or `path`, not both
   */
  path?: string

  /**
   * If true, pin all blocked linked to from the pinned CID
   */
  recursive?: boolean

  /**
   * A human readable string to store with this pin
   */
  comments?: string
}

export type PinType = 'recursive' | 'direct' | 'indirect' | 'all'

export type PinQueryType = 'recursive' | 'direct' | 'indirect' | 'all'

export interface LsOptions extends ClientOptions {
  paths?: CID | CID[] | string | string[]
  type?: PinQueryType
}

export interface LsResult {
  cid: CID
  type: PinType | string
  metadata?: Record<string, any>
}

export interface RmOptions extends ClientOptions {
  recursive?: boolean
}

export interface RmAllInput {
  cid?: CID
  path?: string
  recursive?: boolean
}

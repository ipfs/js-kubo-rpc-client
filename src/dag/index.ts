import { createExport } from './export.js'
import { createGet } from './get.js'
import { createImport } from './import.js'
import { createPut } from './put.js'
import { createResolve } from './resolve.js'
import type { CID } from 'multiformats'
import type { Client } from '../lib/core.js'
import type { ClientOptions, IPFSPath, Multicodecs, PreloadOptions } from '../index.js'

export function createDag (codecs: Multicodecs, client: Client): DagAPI {
  return {
    export: createExport(client),
    get: createGet(codecs, client),
    import: createImport(client),
    put: createPut(codecs, client),
    resolve: createResolve(client)
  }
}

export interface DagAPI {
  /**
   * Retrieve an IPLD format node
   *
   * @example
   * ```js
   * // example obj
   * const obj = {
   *   a: 1,
   *   b: [1, 2, 3],
   *   c: {
   *     ca: [5, 6, 7],
   *     cb: 'foo'
   *   }
   * }
   *
   * const cid = await ipfs.dag.put(obj, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })
   * console.log(cid.toString())
   * // zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5
   *
   * async function getAndLog(cid, path) {
   *   const result = await ipfs.dag.get(cid, { path })
   *   console.log(result.value)
   * }
   *
   * await getAndLog(cid, '/a')
   * // Logs:
   * // 1
   *
   * await getAndLog(cid, '/b')
   * // Logs:
   * // [1, 2, 3]
   *
   * await getAndLog(cid, '/c')
   * // Logs:
   * // {
   * //   ca: [5, 6, 7],
   * //   cb: 'foo'
   * // }
   *
   * await getAndLog(cid, '/c/ca/1')
   * // Logs:
   * // 6
   * ```
   */
  get: (cid: CID, options?: GetOptions) => Promise<GetResult>

  /**
   * Store an IPLD format node
   *
   * @example
   * ```js
   * const obj = { simple: 'object' }
   * const cid = await ipfs.dag.put(obj, { storeCodec: 'dag-cbor', hashAlg: 'sha2-512' })
   *
   * console.log(cid.toString())
   * // zBwWX9ecx5F4X54WAjmFLErnBT6ByfNxStr5ovowTL7AhaUR98RWvXPS1V3HqV1qs3r5Ec5ocv7eCdbqYQREXNUfYNuKG
   * ```
   */
  put: (node: any, options?: PutOptions) => Promise<CID>

  /**
   * Returns the CID and remaining path of the node at the end of the passed IPFS path
   *
   * @example
   * ```JavaScript
   * // example obj
   * const obj = {
   *   a: 1,
   *   b: [1, 2, 3],
   *   c: {
   *     ca: [5, 6, 7],
   *     cb: 'foo'
   *   }
   * }
   *
   * const cid = await ipfs.dag.put(obj, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })
   * console.log(cid.toString())
   * // bafyreicyer3d34cutdzlsbe2nqu5ye62mesuhwkcnl2ypdwpccrsecfmjq
   *
   * const result = await ipfs.dag.resolve(`${cid}/c/cb`)
   * console.log(result)
   * // Logs:
   * // {
   * //   cid: CID(bafyreicyer3d34cutdzlsbe2nqu5ye62mesuhwkcnl2ypdwpccrsecfmjq),
   * //   remainderPath: 'c/cb'
   * // }
   * ```
   */
  resolve: (ipfsPath: IPFSPath, options?: ResolveOptions) => Promise<ResolveResult>

  /**
   * Exports a CAR for the entire DAG available from the given root CID. The CAR will have a single
   * root and IPFS will attempt to fetch and bundle all blocks that are linked within the connected
   * DAG.
   */
  export: (root: CID, options?: ExportOptions) => AsyncIterable<Uint8Array>

  /**
   * Import all blocks from one or more CARs and optionally recursively pin the roots identified
   * within the CARs.
   */
  import: (sources: Iterable<Uint8Array> | AsyncIterable<Uint8Array> | AsyncIterable<AsyncIterable<Uint8Array>> | Iterable<AsyncIterable<Uint8Array>>, options?: ImportOptions) => AsyncIterable<ImportResult>
}

export interface GetOptions extends ClientOptions, PreloadOptions {
  /**
   * An optional path within the DAG to resolve
   */
  path?: string

  /**
   * If set to true, it will avoid resolving through different objects
   */
  localResolve?: boolean
}

export interface GetResult {
  /**
   * The value or node that was fetched during the get operation
   */
  value: any

  /**
   * The remainder of the Path that the node was unable to resolve or what was left in a localResolve scenario
   */
  remainderPath?: string
}

export interface PutOptions extends ClientOptions, PreloadOptions {
  /**
   * The codec that the input object is encoded with if a pre-encoded object is supplied.
   */
  inputCodec?: string

  /**
   * The codec that the stored object will be encoded with (defaults to 'dag-cbor')
   */
  storeCodec?: string

  /**
   * Multihash hashing algorithm to use (defaults to 'sha2-256')
   */
  hashAlg?: string

  /**
   * Pin this block when adding. (Defaults to `false`)
   */
  pin?: boolean
}

export interface RmOptions extends ClientOptions {
  /**
   * Ignores non-existent blocks
   */
  force?: boolean
}

export interface TreeOptions extends ClientOptions, PreloadOptions {
  /**
   * An optional path within the DAG to resolve
   */
  path?: string

  /**
   * If set to true, it will follow the links and continuously run tree on them, returning all the paths in the graph
   */
  recursive?: boolean
}

export interface ResolveOptions extends ClientOptions, PreloadOptions {
  /**
   * If ipfsPath is a CID, you may pass a path here
   */
  path?: string
}

export interface ResolveResult {
  /**
   * The last CID encountered during the traversal and the path to the end of the IPFS path inside the node referenced by the CID
   */
  cid: CID

  /**
   * The remainder of the Path that the node was unable to resolve
   */
  remainderPath?: string
}

export interface ExportOptions extends ClientOptions, PreloadOptions {
}

export interface ImportOptions extends ClientOptions, PreloadOptions {
  /**
   * Recursively pin roots for the imported CARs, defaults to true.
   */
  pinRoots?: boolean
}

export interface ImportResult {
  /**
   * A list of roots and their pin status if `pinRoots` was set.
   */
  root: ImportRootStatus
}

export interface ImportRootStatus {
  /**
   * CID of a root that was recursively pinned.
   */
  cid: CID

  /**
   * The error message if the pin was unsuccessful.
   */
  pinErrorMsg?: string
}

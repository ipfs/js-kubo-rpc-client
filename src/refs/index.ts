import { CID } from 'multiformats/cid'
import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { createLocal } from './local.js'
import type { ClientOptions, IPFSPath, PreloadOptions } from '../index.js'
import type { Client } from '../lib/core.js'

export function createRefs (client: Client): RefsAPI {
  const refs = async function * (args: IPFSPath | IPFSPath[], options?: RefsOptions): AsyncIterable<RefsResult> {
    const argsArr: IPFSPath[] = Array.isArray(args) ? args : [args]

    const res = await client.post('refs', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: argsArr.map(arg => (arg instanceof Uint8Array ? CID.decode(arg) : arg).toString()),
        ...options
      }),
      headers: options?.headers,
      transform: objectToCamel
    })

    yield * res.ndjson()
  }

  return Object.assign(refs, {
    local: createLocal(client)
  })
}

export interface RefsAPI {
  /**
   * Get links (references) from an object
   */
  (ipfsPath: IPFSPath | IPFSPath[], options?: RefsOptions): AsyncIterable<RefsResult>

  /**
   * List blocks stored in the local block store
   */
  local: { (options?: ClientOptions): AsyncIterable<RefsResult> }
}

export interface Refs{ (ipfsPath: IPFSPath | IPFSPath[], options?: RefsOptions): AsyncIterable<RefsResult> }

export interface RefsOptions extends ClientOptions, PreloadOptions {
  recursive?: boolean
  unique?: boolean
  format?: string
  edges?: boolean
  maxDepth?: number
}

export interface Local { (options?: ClientOptions): AsyncIterable<RefsResult> }

export interface RefsResult {
  ref: string
  err?: Error
}

import { CID } from 'multiformats/cid'
import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { createLocal } from './local.js'
import type { HTTPRPCOptions, IPFSPath } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export interface RefsAPI {
  /**
   * Get links (references) from an object
   */
  (ipfsPath: IPFSPath | IPFSPath[], options?: RefsOptions): AsyncIterable<RefsResult>

  /**
   * List blocks stored in the local block store
   */
  local(options?: HTTPRPCOptions): AsyncIterable<RefsResult>
}

export interface RefsOptions extends HTTPRPCOptions {
  recursive?: boolean
  unique?: boolean
  format?: string
  edges?: boolean
  maxDepth?: number
}

export interface RefsResult {
  ref: string
  err?: Error
}

export function createRefs (client: HTTPRPCClient): RefsAPI {
  async function * refs (args: IPFSPath | IPFSPath[], options: RefsOptions = {}): AsyncIterable<RefsResult> {
    const argsArr = Array.isArray(args) ? args : [args]

    const res = await client.post('refs', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: argsArr.map(arg => `${arg instanceof Uint8Array ? CID.decode(arg) : arg}`),
        ...options
      }),
      headers: options.headers,
      transform: objectToCamel
    })

    yield * res.ndjson()
  }

  return Object.assign(refs, {
    local: createLocal(client)
  })
}

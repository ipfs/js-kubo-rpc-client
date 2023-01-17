import { CID } from 'multiformats/cid'
import type { Client } from './lib/core.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { GetOptions } from './root.js'
import type { IPFSPath } from './index.js'

export function createGet (client: Client) {
  async function * get (path: IPFSPath, options?: GetOptions): AsyncIterable<Uint8Array> {
    const opts: Record<string, any> = {
      arg: `${path instanceof CID ? path.toString() : path}`,
      ...options
    }

    if (opts.compressionLevel != null) {
      opts['compression-level'] = opts.compressionLevel
      delete opts.compressionLevel
    }

    const res = await client.post('get', {
      searchParams: toUrlSearchParams(opts),
      signal: options?.signal,
      headers: options?.headers
    })

    yield * res.iterator()
  }

  return get
}

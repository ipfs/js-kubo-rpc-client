import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createFlush (client: Client) {
  async function flush (path: string, options?: ClientOptions): Promise<CID> {
    if (path == null || typeof path !== 'string') {
      throw new Error('ipfs.files.flush requires a path')
    }

    const res = await client.post('files/flush', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    return CID.parse(data.Cid)
  }

  return flush
}

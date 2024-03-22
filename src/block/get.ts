import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { CID } from 'multiformats/cid'
import type { Client } from '../lib/core.js'
import type { ClientOptions, PreloadOptions } from '../index.js'

export function createGet (client: Client) {
  async function get (cid: CID, options?: ClientOptions & PreloadOptions): Promise<Uint8Array> {
    const res = await client.post('block/get', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options?.headers
    })

    return new Uint8Array(await res.arrayBuffer())
  }

  return get
}

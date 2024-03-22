import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions, PreloadOptions } from '../index.js'

export function createData (client: Client) {
  async function data (cid: CID, options?: ClientOptions & PreloadOptions): Promise<Uint8Array> {
    const res = await client.post('object/data', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: (cid instanceof Uint8Array ? CID.decode(cid) : cid).toString(),
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.arrayBuffer()

    return new Uint8Array(data, 0, data.byteLength)
  }

  return data
}

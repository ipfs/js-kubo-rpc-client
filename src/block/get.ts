import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { BlockAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createGet (client: HTTPRPCClient): BlockAPI['get'] {
  return async function get (cid, options = {}) {
    const res = await client.post('block/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })

    return new Uint8Array(await res.arrayBuffer())
  }
}

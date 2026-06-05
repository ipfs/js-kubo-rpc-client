import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { BlockAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createStat (client: HTTPRPCClient): BlockAPI['stat'] {
  return async function stat (cid, options = {}) {
    const res = await client.post('block/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return { cid: CID.parse(data.Key), size: data.Size }
  }
}

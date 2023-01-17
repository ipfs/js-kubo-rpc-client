import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions, PreloadOptions } from '../index.js'
import type { StatResult } from './index.js'

export function createStat (client: Client) {
  async function stat (cid: CID, options?: ClientOptions & PreloadOptions): Promise<StatResult> {
    const res = await client.post('block/stat', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    return { cid: CID.parse(data.Key), size: data.Size }
  }

  return stat
}

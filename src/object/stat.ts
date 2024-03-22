import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions, PreloadOptions } from '../index.js'
import type { StatResult } from './index.js'

export function createStat (client: Client) {
  async function stat (cid: CID, options?: ClientOptions & PreloadOptions): Promise<StatResult> {
    const res = await client.post('object/stat', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options?.headers
    })

    const output = await res.json()

    return {
      ...output,
      Hash: CID.parse(output.Hash)
    }
  }

  return stat
}

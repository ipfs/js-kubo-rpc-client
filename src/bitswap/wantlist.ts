import { CID } from 'multiformats/cid'
import type { Client } from '../lib/core.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { WantlistOptions } from './index.js'

export function createWantlist (client: Client) {
  async function wantlist (options?: WantlistOptions): Promise<CID[]> {
    const searchParams: any = { ...options }
    if (options?.peer != null) {
      searchParams.peer = options.peer.toString()
    }

    const res = await (await client.post('bitswap/wantlist', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(searchParams),
      headers: options?.headers
    })).json()

    return (res.Keys ?? []).map((k: Record<string, any>) => CID.parse(k['/']))
  }

  return wantlist
}

import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { BitswapAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createWantlist (client: HTTPRPCClient): BitswapAPI['wantlist'] {
  return async function wantlist (options = {}) {
    const res = await (await client.post('bitswap/wantlist', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return (res.Keys ?? []).map((k: any) => CID.parse(k['/']))
  }
}

import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { BitswapAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createWantlistForPeer (client: HTTPRPCClient): BitswapAPI['wantlistForPeer'] {
  return async function wantlistForPeer (peerId, options = {}) {
    const res = await (await client.post('bitswap/wantlist', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        peer: peerId.toString()
      }),
      headers: options.headers
    })).json()

    return (res.Keys ?? []).map((k: any) => CID.parse(k['/']))
  }
}

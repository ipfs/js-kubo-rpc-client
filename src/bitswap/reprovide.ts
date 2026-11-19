import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { BitswapAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createReprovide (client: HTTPRPCClient): BitswapAPI['reprovide'] {
  return async function reprovide (options = {}) {
    const res = await client.post('bitswap/reprovide', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    await res.text()
  }
}

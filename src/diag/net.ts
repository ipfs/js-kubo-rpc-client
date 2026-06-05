import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { DiagAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createNet (client: HTTPRPCClient): DiagAPI['net'] {
  return async function net (options = {}) {
    const res = await client.post('diag/net', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    return res.json()
  }
}

import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { DiagAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createSys (client: HTTPRPCClient): DiagAPI['sys'] {
  return async function sys (options = {}) {
    const res = await client.post('diag/sys', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return res.json()
  }
}

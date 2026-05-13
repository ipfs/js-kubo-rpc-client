import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { LogAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createLs (client: HTTPRPCClient): LogAPI['ls'] {
  return async function ls (options = {}) {
    const res = await client.post('log/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const data = await res.json()
    return data.Strings
  }
}

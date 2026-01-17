import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { ProvideStatOptions, ProvideStats } from './types.js'
import type { ProvideAPI } from './index.ts'

export function createProvideStat (client: HTTPRPCClient):ProvideAPI['stat'] {
  return async function stat (
    options: ProvideStatOptions = {}
  ): Promise<ProvideStats> {
    const res = await client.post('provide/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
      }),
      headers: options.headers
    })
    return res.json()
  }
}


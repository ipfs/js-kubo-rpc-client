import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { ConfigAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createGetAll (client: HTTPRPCClient): ConfigAPI['getAll'] {
  return async function getAll (options = {}) {
    const res = await client.post('config/show', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return data
  }
}

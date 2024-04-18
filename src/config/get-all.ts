import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ConfigAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { ConfigAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createGet (client: HTTPRPCClient): ConfigAPI['get'] {
  return async function get (key, options = {}) {
    if (key == null) {
      throw new Error('key argument is required')
    }

    const res = await client.post('config', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return data.Value
  }
}

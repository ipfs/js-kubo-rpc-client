import { objectToCamel } from '../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { KeyAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createRm (client: HTTPRPCClient): KeyAPI['rm'] {
  return async function rm (name, options = {}) {
    const res = await client.post('key/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return objectToCamel(data.Keys[0])
  }
}

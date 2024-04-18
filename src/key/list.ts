import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { KeyAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createList (client: HTTPRPCClient): KeyAPI['list'] {
  return async function list (options = {}) {
    const res = await client.post('key/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const data = await res.json()

    return (data.Keys ?? []).map((k: any) => objectToCamel(k))
  }
}

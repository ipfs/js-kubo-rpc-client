import { objectToCamel } from '../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { KeyAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

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

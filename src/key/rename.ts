import { objectToCamel } from '../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { KeyAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createRename (client: HTTPRPCClient): KeyAPI['rename'] {
  return async function rename (oldName, newName, options = {}) {
    const res = await client.post('key/rename', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          oldName,
          newName
        ],
        ...options
      }),
      headers: options.headers
    })

    return objectToCamel(await res.json())
  }
}

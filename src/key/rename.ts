import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { KeyAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

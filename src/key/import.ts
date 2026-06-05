import { objectToCamel } from '../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { KeyAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createImport (client: HTTPRPCClient): KeyAPI['import'] {
  return async function importKey (name, pem, password, options = {}) {
    const res = await client.post('key/import', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        pem,
        password,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return objectToCamel(data)
  }
}

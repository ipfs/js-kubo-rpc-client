import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { KeyAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createImport (client: HTTPRPCClient): KeyAPI['import'] {
  return async function importKey (name, file, ipnsBase, format, options = {}) {
    const body = new FormData()
    body.append('key', file)

    const res = await client.post('key/import', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        format,
        'ipns-base': ipnsBase,
        ...options
      }),
      body,
      headers: {
        ...options.headers,
        'Content-Type': 'multipart/form-data'
      }
    })
    const data = await res.json()

    return objectToCamel(data)
  }
}

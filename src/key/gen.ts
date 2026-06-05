import { objectToCamel } from '../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { KeyAPI, KeyGenOptions } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

const defaultOptions: KeyGenOptions = {
  type: 'ed25519'
}

export function createGen (client: HTTPRPCClient): KeyAPI['gen'] {
  return async function gen (name, options = defaultOptions) {
    const res = await client.post('key/gen', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return objectToCamel(data)
  }
}

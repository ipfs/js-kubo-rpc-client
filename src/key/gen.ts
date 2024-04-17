import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { KeyAPI, KeyGenOptions } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

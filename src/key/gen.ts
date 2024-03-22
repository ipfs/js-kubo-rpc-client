import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { GenOptions, Key } from './index.js'

const defaultOptions: GenOptions = {
  type: 'ed25519'
}

export function createGen (client: Client) {
  async function gen (name: string, options: GenOptions = defaultOptions): Promise<Key> {
    const res = await client.post('key/gen', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        arg: name,
        type: options.type.toLowerCase()
      }),
      headers: options.headers
    })
    const data = await res.json()

    // @ts-expect-error server output is not typed
    return objectToCamel(data)
  }

  return gen
}

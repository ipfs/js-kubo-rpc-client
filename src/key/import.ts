import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'
import type { Key } from './index.js'

export function createImport (client: Client) {
  async function importKey (name: string, pem: string, password: string, options?: ClientOptions): Promise<Key> {
    const res = await client.post('key/import', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        pem,
        password,
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    // @ts-expect-error server output is not typed
    return objectToCamel(data)
  }

  return importKey
}

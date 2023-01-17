import type { Client } from '../lib/core.js'
import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ClientOptions } from '../index.js'
import type { Key } from './index.js'

export function createRm (client: Client) {
  async function rm (name: string, options?: ClientOptions): Promise<Key> {
    const res = await client.post('key/rm', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    // @ts-expect-error server output is not typed
    return objectToCamel(data.Keys[0])
  }

  return rm
}

import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'
import type { Key } from './index.js'

export function createList (client: Client) {
  async function list (options?: ClientOptions): Promise<Key[]> {
    const res = await client.post('key/list', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })
    const data = await res.json()

    return (data.Keys ?? []).map((k: any) => objectToCamel(k))
  }

  return list
}

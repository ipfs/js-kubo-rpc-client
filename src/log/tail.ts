import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createTail (client: Client) {
  async function * tail (options?: ClientOptions): AsyncIterable<any> {
    const res = await client.post('log/tail', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    yield * res.ndjson()
  }

  return tail
}

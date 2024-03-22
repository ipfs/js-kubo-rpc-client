import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ClientOptions } from '../index.js'
import type { RefsResult } from './index.js'
import type { Client } from '../lib/core.js'

export function createLocal (client: Client) {
  async function * refsLocal (options?: ClientOptions): AsyncIterable<RefsResult> {
    const res = await client.post('refs/local', {
      signal: options?.signal,
      transform: objectToCamel,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    yield * res.ndjson()
  }
  return refsLocal
}

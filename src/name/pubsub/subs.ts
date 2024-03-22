
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { Client } from '../../lib/core.js'
import type { ClientOptions } from '../../index.js'

export function createSubs (client: Client) {
  async function subs (options?: ClientOptions): Promise<string[]> {
    const res = await client.post('name/pubsub/subs', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })
    const data = await res.json()

    return data.Strings ?? []
  }

  return subs
}

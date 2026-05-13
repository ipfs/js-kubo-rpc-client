import { toUrlSearchParams } from '../../lib/to-url-search-params.ts'
import type { NamePubSubAPI } from './index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'

export function createSubs (client: HTTPRPCClient): NamePubSubAPI['subs'] {
  return async function subs (options = {}) {
    const res = await client.post('name/pubsub/subs', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const data = await res.json()

    return data.Strings ?? []
  }
}

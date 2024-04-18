import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { NamePubSubAPI } from './index.js'
import type { HTTPRPCClient } from '../../lib/core.js'

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

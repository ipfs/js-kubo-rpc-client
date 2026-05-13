import { objectToCamel } from '../../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../../lib/to-url-search-params.ts'
import type { NamePubSubAPI } from './index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'

export function createState (client: HTTPRPCClient): NamePubSubAPI['state'] {
  return async function state (options = {}) {
    const res = await client.post('name/pubsub/state', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return objectToCamel(await res.json())
  }
}

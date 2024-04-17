import { objectToCamel } from '../../lib/object-to-camel.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { NamePubSubAPI } from './index.js'
import type { HTTPRPCClient } from '../../lib/core.js'

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

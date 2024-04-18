import { objectToCamel } from '../../lib/object-to-camel.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { NamePubSubAPI } from './index.js'
import type { HTTPRPCClient } from '../../lib/core.js'

export function createCancel (client: HTTPRPCClient): NamePubSubAPI['cancel'] {
  return async function cancel (name, options = {}) {
    const res = await client.post('name/pubsub/cancel', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    })

    return objectToCamel(await res.json())
  }
}

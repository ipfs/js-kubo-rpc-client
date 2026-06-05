import { objectToCamel } from '../../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../../lib/to-url-search-params.ts'
import type { NamePubSubAPI } from './index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'

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

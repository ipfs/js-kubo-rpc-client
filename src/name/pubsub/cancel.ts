import { objectToCamel } from '../../lib/object-to-camel.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { ClientOptions } from '../../index.js'
import type { PubsubCancelResult } from './index.js'
import type { Client } from '../../lib/core.js'

export function createCancel (client: Client) {
  async function cancel (name: string, options?: ClientOptions): Promise<PubsubCancelResult> {
    const res = await client.post('name/pubsub/cancel', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options?.headers
    })

    // @ts-expect-error server output is not typed
    return objectToCamel(await res.json())
  }

  return cancel
}

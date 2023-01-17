import type { Client } from '../../lib/core.js'
import { objectToCamel } from '../../lib/object-to-camel.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { ClientOptions } from '../../index.js'
import type { PubsubStateResult } from './index.js'

export function createState (client: Client) {
  async function state (options?: ClientOptions): Promise<PubsubStateResult> {
    const res = await client.post('name/pubsub/state', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    // @ts-expect-error server output is not typed
    return objectToCamel(await res.json())
  }
  return state
}

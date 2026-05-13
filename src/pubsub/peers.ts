import { textToUrlSafeRpc } from '../lib/http-rpc-wire-format.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { PubSubAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createPeers (client: HTTPRPCClient): PubSubAPI['peers'] {
  return async function peers (topic, options = {}) {
    const res = await client.post('pubsub/peers', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: textToUrlSafeRpc(topic),
        ...options
      }),
      headers: options.headers
    })

    const { Strings } = await res.json()

    return Strings ?? []
  }
}

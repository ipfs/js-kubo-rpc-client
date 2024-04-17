import { textToUrlSafeRpc } from '../lib/http-rpc-wire-format.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PubSubAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

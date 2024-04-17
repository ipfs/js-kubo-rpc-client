import { anySignal } from 'any-signal'
import { textToUrlSafeRpc } from '../lib/http-rpc-wire-format.js'
import { multipartRequest } from '../lib/multipart-request.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PubSubAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createPublish (client: HTTPRPCClient): PubSubAPI['publish'] {
  return async function publish (topic, data, options = {}) {
    const searchParams = toUrlSearchParams({
      arg: textToUrlSafeRpc(topic),
      ...options
    })

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])

    try {
      const res = await client.post('pubsub/pub', {
        signal,
        searchParams,
        ...(
          await multipartRequest([data], controller, options.headers)
        )
      })

      await res.text()
    } finally {
      signal.clear()
    }
  }
}

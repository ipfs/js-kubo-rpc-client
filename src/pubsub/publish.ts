import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { abortSignal } from '../lib/abort-signal.js'
import { textToUrlSafeRpc } from '../lib/http-rpc-wire-format.js'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'

export function createPublish (client: Client) {
  async function publish (topic: string, data: Uint8Array, options?: ClientOptions): Promise<void> {
    const searchParams = toUrlSearchParams({
      arg: textToUrlSafeRpc(topic),
      ...options
    })

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options?.signal)

    const res = await client.post('pubsub/pub', {
      signal,
      searchParams,
      ...(
        await multipartRequest([data], controller, options?.headers)
      )
    })

    await res.text()
  }

  return publish
}

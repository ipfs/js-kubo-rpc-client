import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { abortSignal } from '../lib/abort-signal.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { mapEvent } from './map-event.js'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'
import type { QueryEvent } from './index.js'

export function createPut (client: Client) {
  async function * put (key: string | Uint8Array, value: Uint8Array, options?: ClientOptions): AsyncIterable<QueryEvent> {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options?.signal)

    const res = await client.post('routing/put', {
      signal,
      searchParams: toUrlSearchParams({
        arg: key instanceof Uint8Array ? uint8ArrayToString(key) : key.toString(),
        ...options
      }),
      ...(
        await multipartRequest([value], controller, options?.headers)
      )
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return put
}

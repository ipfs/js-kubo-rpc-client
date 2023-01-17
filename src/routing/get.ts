import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'
import type { QueryEvent } from './index.js'

export function createGet (client: Client) {
  async function * get (key: string | Uint8Array, options?: ClientOptions): AsyncIterable<QueryEvent> {
    const res = await client.post('routing/get', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        // arg: base36.encode(key),
        arg: key instanceof Uint8Array ? uint8ArrayToString(key) : key.toString(),
        ...options
      }),
      headers: options?.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return get
}

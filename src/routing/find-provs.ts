import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'
import type { CID } from 'multiformats'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'
import type { QueryEvent } from './index.js'

export function createFindProvs (client: Client) {
  async function * findProvs (cid: CID, options?: ClientOptions): AsyncIterable<QueryEvent> {
    const res = await client.post('routing/findprovs', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options?.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return findProvs
}

import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'
import type { CID } from 'multiformats'
import type { Client } from '../lib/core.js'
import type { ProvideOptions, QueryEvent } from './index.js'

export function createProvide (client: Client) {
  async function * provide (cids: CID[] | CID, options: ProvideOptions = { recursive: false }): AsyncIterable<QueryEvent> {
    const cidArr: CID[] = Array.isArray(cids) ? cids : [cids]

    const res = await client.post('routing/provide', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: cidArr.map(cid => cid.toString()),
        ...options
      }),
      headers: options?.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return provide
}

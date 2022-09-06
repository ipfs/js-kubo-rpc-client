import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'

export const createProvide = configure(api => {
  /**
   * @type {import('../types').DHTAPI["provide"]}
   */
  async function * provide (cids, options = { recursive: false }) {
    /** @type {import('../types').CID[]} */
    const cidArr = Array.isArray(cids) ? cids : [cids]

    const res = await api.post('dht/provide', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cidArr.map(cid => cid.toString()),
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return provide
})

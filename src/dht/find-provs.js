import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'

export const createFindProvs = configure(api => {
  /**
   * @type {import('../types.js').DHTAPI["findProvs"]}
   */
  async function * findProvs (cid, options = {}) {
    const res = await api.post('dht/findprovs', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return findProvs
})

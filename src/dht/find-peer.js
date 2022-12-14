import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'

export const createFindPeer = configure(api => {
  /**
   * @type {import('../types').DHTAPI["findPeer"]}
   */
  async function * findPeer (peerId, options = {}) {
    const res = await api.post('dht/findpeer', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: peerId,
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return findPeer
})

import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

export const createGet = configure(api => {
  /**
   * @type {import('../types').DHTAPI["get"]}
   */
  async function * get (key, options = {}) {
    const res = await api.post('dht/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        // arg: base36.encode(key),
        arg: key instanceof Uint8Array ? uint8ArrayToString(key) : key.toString(),
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return get
})

import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createGet = configure(api => {
  /**
   * @type {import('../types').BlockAPI["get"]}
   */
  async function get (cid, options = {}) {
    const res = await api.post('block/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })

    return new Uint8Array(await res.arrayBuffer())
  }
  return get
})

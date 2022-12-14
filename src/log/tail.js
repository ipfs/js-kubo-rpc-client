import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createTail = configure(api => {
  /**
   * @type {import('../types').LogAPI["tail"]}
   */
  async function * tail (options = {}) {
    const res = await api.post('log/tail', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    yield * res.ndjson()
  }
  return tail
})

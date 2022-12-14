import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createLocal = configure(api => {
  /**
   * @type {import('../types').RefsAPI["local"]}
   */
  async function * refsLocal (options = {}) {
    const res = await api.post('refs/local', {
      signal: options.signal,
      transform: objectToCamel,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    yield * res.ndjson()
  }
  return refsLocal
})

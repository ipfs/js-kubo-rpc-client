import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

export const createCat = configure(api => {
  /**
   * @type {import('./types').RootAPI["cat"]}
   */
  async function * cat (path, options = {}) {
    const res = await api.post('cat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path.toString(),
        ...options
      }),
      headers: options.headers
    })

    yield * res.iterator()
  }

  return cat
})

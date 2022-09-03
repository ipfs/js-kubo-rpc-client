import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createRm = configure(api => {
  /**
   * @type {import('../types').KeyAPI["rm"]}
   */
  async function rm (name, options = {}) {
    const res = await api.post('key/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    // @ts-expect-error server output is not typed
    return objectToCamel(data.Keys[0])
  }
  return rm
})

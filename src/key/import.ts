import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createImport = configure(api => {
  /**
   * @type {import('./types.js').KeyAPI['import']}
   */
  async function importKey (name, pem, password, options = {}) {
    const res = await api.post('key/import', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        pem,
        password,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    // @ts-expect-error server output is not typed
    return objectToCamel(data)
  }
  return importKey
})

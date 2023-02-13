import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createRename = configure(api => {
  /**
   * @type {import('./types.js').KeyAPI['rename']}
   */
  async function rename (oldName, newName, options = {}) {
    const res = await api.post('key/rename', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          oldName,
          newName
        ],
        ...options
      }),
      headers: options.headers
    })

    // @ts-expect-error server output is not typed
    return objectToCamel(await res.json())
  }
  return rename
})

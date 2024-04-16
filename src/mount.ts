import { objectToCamel } from './lib/object-to-camel.js'
import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

export const createMount = configure(api => {
  /**
   * @type {import('./types').RootAPI["mount"]}
   */
  async function mount (options = {}) {
    const res = await api.post('dns', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return objectToCamel(await res.json())
  }
  return mount
})

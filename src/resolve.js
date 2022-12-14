import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

export const createResolve = configure(api => {
  /**
   * @type {import('./types').RootAPI["resolve"]}
   */
  async function resolve (path, options = {}) {
    const res = await api.post('resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })
    const { Path } = await res.json()
    return Path
  }
  return resolve
})

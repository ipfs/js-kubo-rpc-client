import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createResolve = configure(api => {
  /**
   * @type {import('../types').NameAPI["resolve"]}
   */
  async function * resolve (path, options = {}) {
    const res = await api.post('name/resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        stream: true,
        ...options
      }),
      headers: options.headers
    })

    for await (const result of res.ndjson()) {
      yield result.Path
    }
  }
  return resolve
})

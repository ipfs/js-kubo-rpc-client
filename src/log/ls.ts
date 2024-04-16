import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createLs = configure(api => {
  /**
   * @type {import('../types').LogAPI["ls"]}
   */
  async function ls (options = {}) {
    const res = await api.post('log/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const data = await res.json()
    return data.Strings
  }
  return ls
})

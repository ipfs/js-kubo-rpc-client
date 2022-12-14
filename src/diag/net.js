import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createNet = configure(api => {
  /**
   * @type {import('../types').DiagAPI["net"]}
   */
  async function net (options = {}) {
    const res = await api.post('diag/net', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    return res.json()
  }
  return net
})

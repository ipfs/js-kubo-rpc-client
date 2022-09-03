import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createConnect = configure(api => {
  /**
   * @type {import('../types').SwarmAPI["connect"]}
   */
  async function connect (addr, options = {}) {
    const res = await api.post('swarm/connect', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    })
    const { Strings } = await res.json()

    return Strings || []
  }
  return connect
})

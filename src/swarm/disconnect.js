import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createDisconnect = configure(api => {
  /**
   * @type {import('../types').SwarmAPI["disconnect"]}
   */
  async function disconnect (addr, options = {}) {
    const res = await api.post('swarm/disconnect', {
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
  return disconnect
})

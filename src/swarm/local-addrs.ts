import { multiaddr } from '@multiformats/multiaddr'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createLocalAddrs = configure(api => {
  /**
   * @type {import('../types.js').SwarmAPI["localAddrs"]}
   */
  async function localAddrs (options = {}) {
    const res = await api.post('swarm/addrs/local', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    /** @type {{ Strings: string[] }} */
    const { Strings } = await res.json()

    return (Strings || []).map(a => multiaddr(a))
  }
  return localAddrs
})

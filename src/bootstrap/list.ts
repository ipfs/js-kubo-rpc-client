import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multiaddr } from '@multiformats/multiaddr'

export const createList = configure(api => {
  /**
   * @type {import('../types').BootstrapAPI["list"]}
   */
  async function list (options = {}) {
    const res = await api.post('bootstrap/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map((/** @type {string} */ ma) => multiaddr(ma)) }
  }

  return list
})

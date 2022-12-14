import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { textToUrlSafeRpc } from '../lib/http-rpc-wire-format.js'

export const createPeers = configure(api => {
  /**
   * @type {import('../types').PubsubAPI["peers"]}
   */
  async function peers (topic, options = {}) {
    const res = await api.post('pubsub/peers', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: textToUrlSafeRpc(topic),
        ...options
      }),
      headers: options.headers
    })

    const { Strings } = await res.json()

    return Strings || []
  }
  return peers
})

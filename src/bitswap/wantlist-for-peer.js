import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createWantlistForPeer = configure(api => {
  /**
   * @type {import('../types').BitswapAPI["wantlistForPeer"]}
   */
  async function wantlistForPeer (peerId, options = {}) {
    const res = await (await api.post('bitswap/wantlist', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        peer: peerId.toString()
      }),
      headers: options.headers
    })).json()

    return (res.Keys || []).map((/** @type {{ '/': string }} */ k) => CID.parse(k['/']))
  }
  return wantlistForPeer
})

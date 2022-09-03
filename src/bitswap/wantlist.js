import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions

export type BitswapAPI = import('ipfs-core-types/src/bitswap').API<HTTPClientExtraOptions>
export type BitswapAPI = import('ipfs-core-types/src/bitswap').API<HTTPClientExtraOptions>
 */

export const createWantlist = configure(api => {
  /**
   * @type {import('../types').BitswapAPI["wantlist"]}
   */
  async function wantlist (options = {}) {
    const res = await (await api.post('bitswap/wantlist', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return (res.Keys || []).map((/** @type {{ '/': string }} */ k) => CID.parse(k['/']))
  }
  return wantlist
})

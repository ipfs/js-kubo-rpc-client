import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createStat = configure(api => {
  /**
   * @type {import('../types.js').ObjectAPI["stat"]}
   */
  async function stat (cid, options = {}) {
    const res = await api.post('object/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${cid}`,
        ...options
      }),
      headers: options.headers
    })

    const output = await res.json()

    return {
      ...output,
      Hash: CID.parse(output.Hash)
    }
  }
  return stat
})

import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createStat = configure(api => {
  /**
   * @type {import('../types').BlockAPI["stat"]}
   */
  async function stat (cid, options = {}) {
    const res = await api.post('block/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return { cid: CID.parse(data.Key), size: data.Size }
  }

  return stat
})

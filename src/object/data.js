import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createData = configure(api => {
  /**
   * @type {import('../types').ObjectAPI["data"]}
   */
  async function data (cid, options = {}) {
    const res = await api.post('object/data', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${cid instanceof Uint8Array ? CID.decode(cid) : cid}`,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.arrayBuffer()

    return new Uint8Array(data, 0, data.byteLength)
  }
  return data
})

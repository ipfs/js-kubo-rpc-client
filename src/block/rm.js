import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createRm = configure(api => {
  /**
   * @type {import('../types').BlockAPI["rm"]}
   */
  async function * rm (cid, options = {}) {
    if (!Array.isArray(cid)) {
      cid = [cid]
    }

    const res = await api.post('block/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.map(cid => cid.toString()),
        'stream-channels': true,
        ...options
      }),
      headers: options.headers
    })

    for await (const removed of res.ndjson()) {
      yield toCoreInterface(removed)
    }
  }

  return rm
})

/**
 * @param {*} removed
 */
function toCoreInterface (removed) {
  /** @type {import('../types').RmResult} */
  const out = {
    cid: CID.parse(removed.Hash)
  }

  if (removed.Error) {
    out.error = new Error(removed.Error)
  }

  return out
}

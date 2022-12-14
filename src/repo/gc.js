import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createGc = configure(api => {
  /**
   * @type {import('../types').RepoAPI["gc"]}
   */
  async function * gc (options = {}) {
    const res = await api.post('repo/gc', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers,
      transform: (res) => {
        return {
          err: res.Error ? new Error(res.Error) : null,
          cid: (res.Key || {})['/'] ? CID.parse(res.Key['/']) : null
        }
      }
    })

    yield * res.ndjson()
  }
  return gc
})

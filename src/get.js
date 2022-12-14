import { CID } from 'multiformats/cid'
import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

export const createGet = configure(api => {
  /**
   * @type {import('./types').RootAPI["get"]}
   */
  async function * get (path, options = {}) {
    /** @type {Record<string, any>} */
    const opts = {
      arg: `${path instanceof Uint8Array ? CID.decode(path) : path}`,
      ...options
    }

    if (opts.compressionLevel) {
      opts['compression-level'] = opts.compressionLevel
      delete opts.compressionLevel
    }

    const res = await api.post('get', {
      signal: options.signal,
      searchParams: toUrlSearchParams(opts),
      headers: options.headers
    })

    yield * res.iterator()
  }

  return get
})

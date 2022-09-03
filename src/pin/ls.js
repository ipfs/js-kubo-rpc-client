import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @param {string} type
 * @param {string} cid
 * @param {Record<string, string>} metadata
 */
function toPin (type, cid, metadata) {
  /** @type {import('../types').LsResult} */
  const pin = {
    type,
    cid: CID.parse(cid)
  }

  if (metadata) {
    pin.metadata = metadata
  }

  return pin
}

export const createLs = configure(api => {
  /**
   * @type {import('../types').PinAPI["ls"]}
   */
  async function * ls (options = {}) {
    /** @type {any[]} */
    let paths = []

    if (options.paths) {
      paths = Array.isArray(options.paths) ? options.paths : [options.paths]
    }

    const res = await api.post('pin/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        arg: paths.map(path => `${path}`),
        stream: true
      }),
      headers: options.headers
    })

    for await (const pin of res.ndjson()) {
      if (pin.Keys) { // non-streaming response
        for (const cid of Object.keys(pin.Keys)) {
          yield toPin(pin.Keys[cid].Type, cid, pin.Keys[cid].Metadata)
        }
        return
      }

      yield toPin(pin.Type, pin.Cid, pin.Metadata)
    }
  }
  return ls
})

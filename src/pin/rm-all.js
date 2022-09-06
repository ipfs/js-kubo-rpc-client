import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { normaliseInput } from 'ipfs-core-utils/pins/normalise-input'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createRmAll = configure(api => {
  /**
   * @type {import('../types').PinAPI["rmAll"]}
   */
  async function * rmAll (source, options = {}) {
    for await (const { path, recursive } of normaliseInput(source)) {
      const searchParams = new URLSearchParams(options.searchParams)
      searchParams.append('arg', `${path}`)

      if (recursive != null) searchParams.set('recursive', String(recursive))

      const res = await api.post('pin/rm', {
        signal: options.signal,
        headers: options.headers,
        searchParams: toUrlSearchParams({
          ...options,
          arg: `${path}`,
          recursive
        })
      })

      for await (const pin of res.ndjson()) {
        if (pin.Pins) { // non-streaming response
          yield * pin.Pins.map((/** @type {string} */ cid) => CID.parse(cid))
          // eslint-disable-next-line no-continue
          continue
        }
        yield CID.parse(pin)
      }
    }
  }
  return rmAll
})

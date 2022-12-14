import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { normaliseInput } from 'ipfs-core-utils/pins/normalise-input'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createAddAll = configure(api => {
  /**
   * @type {import('../types').PinAPI["addAll"]}
   */
  async function * addAll (source, options = {}) {
    for await (const { path, recursive, metadata } of normaliseInput(source)) {
      const res = await api.post('pin/add', {
        signal: options.signal,
        searchParams: toUrlSearchParams({
          ...options,
          arg: path,
          recursive,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          stream: true
        }),
        headers: options.headers
      })

      for await (const pin of res.ndjson()) {
        if (pin.Pins) { // non-streaming response
          for (const cid of pin.Pins) {
            yield CID.parse(cid)
          }
          // eslint-disable-next-line no-continue
          continue
        }

        yield CID.parse(pin)
      }
    }
  }
  return addAll
})

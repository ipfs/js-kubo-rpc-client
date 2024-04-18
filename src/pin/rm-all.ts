import { CID } from 'multiformats/cid'
import { normaliseInput } from '../lib/pins/normalise-input.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PinAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createRmAll (client: HTTPRPCClient): PinAPI['rmAll'] {
  return async function * rmAll (source, options = {}) {
    for await (const { path, recursive } of normaliseInput(source)) {
      const searchParams = new URLSearchParams(options.searchParams)
      searchParams.append('arg', `${path}`)

      if (recursive != null) searchParams.set('recursive', String(recursive))

      const res = await client.post('pin/rm', {
        signal: options.signal,
        headers: options.headers,
        searchParams: toUrlSearchParams({
          ...options,
          arg: `${path}`,
          recursive
        })
      })

      for await (const pin of res.ndjson()) {
        if (pin.Pins != null) { // non-streaming response
          yield * pin.Pins.map((cid: string) => CID.parse(cid))
          // eslint-disable-next-line no-continue
          continue
        }
        yield CID.parse(pin)
      }
    }
  }
}

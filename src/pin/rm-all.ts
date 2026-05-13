import { CID } from 'multiformats/cid'
import { normaliseInput } from '../lib/pins/normalise-input.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { PinAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createRmAll (client: HTTPRPCClient): PinAPI['rmAll'] {
  return async function * rmAll (source, options = {}) {
    for await (const { path, recursive } of normaliseInput(source)) {
      const searchParams = new URLSearchParams(options.searchParams)
      searchParams.append('arg', `${path}`)

      if (recursive != null) { searchParams.set('recursive', String(recursive)) }

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

          continue
        }
        yield CID.parse(pin)
      }
    }
  }
}

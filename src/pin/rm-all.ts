import { CID } from 'multiformats/cid'
import { normaliseInput } from 'ipfs-core-utils/pins/normalise-input'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { RmAllInput, RmOptions } from './index.js'
import type { Client } from '../lib/core.js'
import type { AwaitIterable } from '../index.js'

export function createRmAll (client: Client) {
  async function * rmAll (source: AwaitIterable<RmAllInput>, options?: RmOptions): AsyncIterable<CID> {
    for await (const { path, recursive } of normaliseInput(source)) {
      const searchParams = new URLSearchParams(options?.searchParams)
      searchParams.append('arg', path.toString())

      if (recursive != null) searchParams.set('recursive', String(recursive))

      const res = await client.post('pin/rm', {
        signal: options?.signal,
        headers: options?.headers,
        searchParams: toUrlSearchParams({
          ...options,
          arg: path.toString(),
          recursive
        })
      })

      for await (const pin of res.ndjson()) {
        if (pin?.Pins != null) { // non-streaming response
          yield * pin.Pins.map((cid: string) => CID.parse(cid))
          // eslint-disable-next-line no-continue
          continue
        }
        yield CID.parse(pin)
      }
    }
  }

  return rmAll
}

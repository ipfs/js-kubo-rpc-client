import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { PinAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createUpdate (client: HTTPRPCClient): PinAPI['update'] {
  return async function update (from, to, options = {}) {
    const res = await client.post('pin/update', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        arg: [from.toString(), to.toString()]
      }),
      headers: options.headers
    })

    const { Pins } = await res.json()
    return Pins.map((cid: string) => CID.parse(cid))
  }
}

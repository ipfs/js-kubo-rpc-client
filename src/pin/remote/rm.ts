import { encodeQuery } from './utils.ts'
import type { PinRemoteAPI } from './index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'

export function createRm (client: HTTPRPCClient): PinRemoteAPI['rm'] {
  return async function rm ({ timeout, signal, headers, ...query }) {
    await client.post('pin/remote/rm', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery({
        ...query,
        all: false
      })
    })
  }
}

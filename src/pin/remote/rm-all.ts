import { encodeQuery } from './utils.ts'
import type { PinRemoteAPI } from './index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'

export function createRmAll (client: HTTPRPCClient): PinRemoteAPI['rmAll'] {
  return async function rmAll ({ timeout, signal, headers, ...query }) {
    await client.post('pin/remote/rm', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery({
        ...query,
        all: true
      })
    })
  }
}

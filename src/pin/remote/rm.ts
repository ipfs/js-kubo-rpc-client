import { encodeQuery } from './utils.js'
import type { PinRemoteAPI } from './index.js'
import type { HTTPRPCClient } from '../../lib/core.js'

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

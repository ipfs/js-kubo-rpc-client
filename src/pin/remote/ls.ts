import { encodeQuery, decodePin } from './utils.ts'
import type { PinRemoteAPI } from './index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'

export function createLs (client: HTTPRPCClient): PinRemoteAPI['ls'] {
  return async function * ls ({ timeout, signal, headers, ...query }) {
    const response = await client.post('pin/remote/ls', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery(query)
    })

    for await (const pin of response.ndjson()) {
      yield decodePin(pin)
    }
  }
}

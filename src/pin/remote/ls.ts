import { encodeQuery, decodePin } from './utils.js'
import type { PinRemoteAPI } from './index.js'
import type { HTTPRPCClient } from '../../lib/core.js'

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

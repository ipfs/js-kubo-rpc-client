import { encodeAddParams, decodePin } from './utils.ts'
import type { PinRemoteAPI } from './index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'

export function createAdd (client: HTTPRPCClient): PinRemoteAPI['add'] {
  return async function add (cid, { timeout, signal, headers, ...query }) {
    const response = await client.post('pin/remote/add', {
      timeout,
      signal,
      headers,
      searchParams: encodeAddParams(cid, query)
    })

    return decodePin(await response.json())
  }
}

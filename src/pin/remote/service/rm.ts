import { toUrlSearchParams } from '../../../lib/to-url-search-params.ts'
import type { PinRemoteServiceAPI } from './index.ts'
import type { HTTPRPCClient } from '../../../lib/core.ts'

export function createRm (client: HTTPRPCClient): PinRemoteServiceAPI['rm'] {
  return async function rm (name, options = {}) {
    await client.post('pin/remote/service/rm', {
      signal: options.signal,
      headers: options.headers,
      searchParams: toUrlSearchParams({
        arg: name
      })
    })
  }
}

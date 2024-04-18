import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'
import type { PinRemoteServiceAPI } from './index.js'
import type { HTTPRPCClient } from '../../../lib/core.js'

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

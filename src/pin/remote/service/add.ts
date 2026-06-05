import { toUrlSearchParams } from '../../../lib/to-url-search-params.ts'
import { encodeEndpoint } from './utils.ts'
import type { PinRemoteServiceAPI } from './index.ts'
import type { HTTPRPCClient } from '../../../lib/core.ts'

export function createAdd (client: HTTPRPCClient): PinRemoteServiceAPI['add'] {
  return async function add (name, options) {
    const { endpoint, key, headers, timeout, signal } = options

    await client.post('pin/remote/service/add', {
      timeout,
      signal,
      searchParams: toUrlSearchParams({
        arg: [name, encodeEndpoint(endpoint), key]
      }),
      headers
    })
  }
}

import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'
import { encodeEndpoint } from './utils.js'
import type { PinRemoteServiceAPI } from './index.js'
import type { HTTPRPCClient } from '../../../lib/core.js'

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

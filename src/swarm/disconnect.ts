import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { SwarmAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createDisconnect (client: HTTPRPCClient): SwarmAPI['disconnect'] {
  return async function disconnect (addr, options = {}) {
    const res = await client.post('swarm/disconnect', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    })
    const { Strings } = await res.json()

    return Strings ?? []
  }
}

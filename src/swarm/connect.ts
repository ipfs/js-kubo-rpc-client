import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { SwarmAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createConnect (client: HTTPRPCClient): SwarmAPI['connect'] {
  return async function connect (addr, options = {}) {
    const res = await client.post('swarm/connect', {
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

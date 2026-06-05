import { multiaddr } from '@multiformats/multiaddr'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { SwarmAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createLocalAddrs (client: HTTPRPCClient): SwarmAPI['localAddrs'] {
  return async function localAddrs (options = {}) {
    const res = await client.post('swarm/addrs/local', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const { Strings } = await res.json()

    return (Strings ?? []).map((a: any) => multiaddr(a))
  }
}

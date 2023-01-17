import { Multiaddr, multiaddr } from '@multiformats/multiaddr'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createLocalAddrs (client: Client) {
  async function localAddrs (options?: ClientOptions): Promise<Multiaddr[]> {
    const res = await client.post('swarm/addrs/local', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    const { Strings } = await res.json()
    return (Strings ?? []).map((a: string) => multiaddr(a))
  }

  return localAddrs
}

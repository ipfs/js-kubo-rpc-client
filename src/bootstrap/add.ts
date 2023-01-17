import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multiaddr } from '@multiformats/multiaddr'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'

export function createAdd (client: Client) {
  async function add (addr: Multiaddr, options?: ClientOptions): Promise<{ Peers: Multiaddr[] }> {
    const res = await client.post('bootstrap/add', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options?.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map((ma: string) => multiaddr(ma)) }
  }

  return add
}

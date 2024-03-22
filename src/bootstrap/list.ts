import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { Multiaddr, multiaddr } from '@multiformats/multiaddr'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'

export function createList (client: Client) {
  async function list (options?: ClientOptions): Promise<{ Peers: Multiaddr[] }> {
    const res = await client.post('bootstrap/list', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map((ma: string) => multiaddr(ma)) }
  }

  return list
}

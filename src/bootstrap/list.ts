import { multiaddr } from '@multiformats/multiaddr'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { BootstrapAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createList (client: HTTPRPCClient): BootstrapAPI['list'] {
  return async function list (options = {}) {
    const res = await client.post('bootstrap/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map((ma: any) => multiaddr(ma)) }
  }
}

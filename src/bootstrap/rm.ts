import { multiaddr } from '@multiformats/multiaddr'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { BootstrapAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createRm (client: HTTPRPCClient): BootstrapAPI['rm'] {
  return async function rm (addr, options = {}) {
    const res = await client.post('bootstrap/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map((ma: any) => multiaddr(ma)) }
  }
}

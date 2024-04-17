import { peerIdFromString } from '@libp2p/peer-id'
import { multiaddr } from '@multiformats/multiaddr'
import { objectToCamel } from './lib/object-to-camel.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { KuboRPCClient } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

export function createId (client: HTTPRPCClient): KuboRPCClient['id'] {
  return async function id (options = {}) {
    const res = await client.post('id', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: options.peerId != null ? options.peerId.toString() : undefined,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    const output = {
      ...objectToCamel<any>(data)
    }

    output.id = peerIdFromString(output.id)

    if (output.addresses != null) {
      output.addresses = output.addresses.map((ma: any) => multiaddr(ma))
    }

    return output
  }
}

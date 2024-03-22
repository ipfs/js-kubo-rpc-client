import { objectToCamel } from './lib/object-to-camel.js'
import { multiaddr } from '@multiformats/multiaddr'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import { peerIdFromString } from '@libp2p/peer-id'
import type { Client } from './lib/core.js'
import type { IDOptions, IDResult } from './root.js'

export function createId (client: Client) {
  async function id (options?: IDOptions): Promise<IDResult> {
    const res = await client.post('id', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: options?.peerId != null ? options?.peerId.toString() : undefined,
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    const output = {
      ...objectToCamel(data)
    }

    output.id = peerIdFromString(output.id)

    if (output.addresses != null) {
      output.addresses = output.addresses.map((ma: string) => multiaddr(ma))
    }

    // @ts-expect-error server output is not typed
    return output
  }

  return id
}

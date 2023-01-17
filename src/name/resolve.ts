import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Client } from '../lib/core.js'
import type { ResolveOptions } from './index.js'

export function createResolve (client: Client) {
  async function * resolve (path: PeerId | string, options?: ResolveOptions): AsyncIterable<string> {
    const res = await client.post('name/resolve', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        stream: true,
        ...options
      }),
      headers: options?.headers
    })

    for await (const result of res.ndjson()) {
      yield result.Path
    }
  }

  return resolve
}

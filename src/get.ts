import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from './lib/to-url-search-params.ts'
import type { KuboRPCClient } from './index.ts'
import type { HTTPRPCClient } from './lib/core.ts'

export function createGet (client: HTTPRPCClient): KuboRPCClient['get'] {
  return async function * get (path, options = {}) {
    const opts: Record<string, any> = {
      arg: `${path instanceof Uint8Array ? CID.decode(path) : path}`,
      ...options
    }

    const res = await client.post('get', {
      signal: options.signal,
      searchParams: toUrlSearchParams(opts),
      headers: options.headers
    })

    yield * res.iterator()
  }
}

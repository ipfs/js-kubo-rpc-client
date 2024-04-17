import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { KuboRPCClient } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

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

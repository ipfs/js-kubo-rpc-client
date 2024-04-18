import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { KuboRPCClient } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

export function createCat (client: HTTPRPCClient): KuboRPCClient['cat'] {
  return async function * cat (path, options = {}) {
    const res = await client.post('cat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path.toString(),
        ...options
      }),
      headers: options.headers
    })

    yield * res.iterator()
  }
}

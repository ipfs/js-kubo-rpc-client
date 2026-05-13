import { toUrlSearchParams } from './lib/to-url-search-params.ts'
import type { KuboRPCClient } from './index.ts'
import type { HTTPRPCClient } from './lib/core.ts'

export function createResolve (client: HTTPRPCClient): KuboRPCClient['resolve'] {
  return async function resolve (path, options = {}) {
    const res = await client.post('resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })
    const { Path } = await res.json()
    return Path
  }
}

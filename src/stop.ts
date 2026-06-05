import { toUrlSearchParams } from './lib/to-url-search-params.ts'
import type { KuboRPCClient } from './index.ts'
import type { HTTPRPCClient } from './lib/core.ts'

export function createStop (client: HTTPRPCClient): KuboRPCClient['stop'] {
  return async function stop (options = {}) {
    const res = await client.post('shutdown', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    await res.text()
  }
}

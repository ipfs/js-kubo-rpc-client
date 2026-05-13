import { objectToCamel } from './lib/object-to-camel.ts'
import { toUrlSearchParams } from './lib/to-url-search-params.ts'
import type { KuboRPCClient } from './index.ts'
import type { HTTPRPCClient } from './lib/core.ts'

export function createMount (client: HTTPRPCClient): KuboRPCClient['mount'] {
  return async function mount (options = {}) {
    const res = await client.post('dns', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return objectToCamel(await res.json())
  }
}

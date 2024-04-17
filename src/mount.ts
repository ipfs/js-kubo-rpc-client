import { objectToCamel } from './lib/object-to-camel.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { KuboRPCClient } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

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

import { objectToCamel } from './lib/object-to-camel.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { KuboRPCClient } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

export function createVersion (client: HTTPRPCClient): KuboRPCClient['version'] {
  return async function version (options = {}) {
    const res = await client.post('version', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return {
      ...objectToCamel<any>(await res.json()),
      'ipfs-http-client': '1.0.0'
    }
  }
}

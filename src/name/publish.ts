import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { NameAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createPublish (client: HTTPRPCClient): NameAPI['publish'] {
  return async function publish (path, options = {}) {
    const res = await client.post('name/publish', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${path}`,
        ...options
      }),
      headers: options.headers
    })

    return objectToCamel(await res.json())
  }
}

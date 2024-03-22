import { objectToCamel } from './lib/object-to-camel.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { ClientOptions } from './index.js'
import type { Client } from './lib/core.js'
import type { VersionResult } from './root.js'

export function createVersion (client: Client) {
  async function version (options?: ClientOptions): Promise<VersionResult> {
    const res = await client.post('version', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    // @ts-expect-error server output is not typed
    return {
      ...objectToCamel(await res.json()),
      'kubo-rpc-client': '1.0.0' // TODO: get version from package.json
    }
  }

  return version
}

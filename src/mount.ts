import { objectToCamel } from './lib/object-to-camel.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { Client } from './lib/core.js'
import type { MountOptions, MountResult } from './root.js'

export function createMount (client: Client) {
  async function mount (options?: MountOptions): Promise<MountResult> {
    const res = await client.post('dns', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    return objectToCamel(await res.json())
  }

  return mount
}

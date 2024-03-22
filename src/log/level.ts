import { objectToCamel } from '../lib/object-to-camel.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createLevel (client: Client) {
  async function level (subsystem: string, level: string, options?: ClientOptions): Promise<any> {
    const res = await client.post('log/level', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: [
          subsystem,
          level
        ],
        ...options
      }),
      headers: options?.headers
    })

    return objectToCamel(await res.json())
  }

  return level
}

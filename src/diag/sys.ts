import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createSys (client: Client) {
  async function sys (options?: ClientOptions): Promise<any> {
    const res = await client.post('diag/sys', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    return await res.json()
  }
  return sys
}

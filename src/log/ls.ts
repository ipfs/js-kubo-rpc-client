import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createLs (client: Client) {
  async function ls (options?: ClientOptions): Promise<any> {
    const res = await client.post('log/ls', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    const data = await res.json()
    return data.Strings
  }

  return ls
}

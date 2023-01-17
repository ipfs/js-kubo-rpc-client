import type { Client } from '../lib/core.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ClientOptions } from '../index.js'

export function createVersion (client: Client) {
  async function version (options?: ClientOptions): Promise<number> {
    const res = await (await client.post('repo/version', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })).json()

    return res.Version
  }

  return version
}

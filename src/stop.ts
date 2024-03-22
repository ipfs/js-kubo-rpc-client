import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { Client } from './lib/core.js'
import type { ClientOptions } from './index.js'

export function createStop (client: Client) {
  async function stop (options?: ClientOptions): Promise<void> {
    const res = await client.post('shutdown', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    await res.text()
  }

  return stop
}

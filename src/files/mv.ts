import type { Client } from '../lib/core.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ClientOptions } from '../index.js'

export function createMv (client: Client) {
  async function mv (sources: string | string[], destination: string, options?: ClientOptions): Promise<void> {
    if (!Array.isArray(sources)) {
      sources = [sources]
    }

    const res = await client.post('files/mv', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: sources.concat(destination),
        ...options
      }),
      headers: options?.headers
    })
    await res.text()
  }

  return mv
}

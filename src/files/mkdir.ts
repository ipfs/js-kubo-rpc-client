import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { MkdirOptions } from './index.js'
import type { Client } from '../lib/core.js'

export function createMkdir (client: Client) {
  async function mkdir (path: string, options?: MkdirOptions): Promise<void> {
    const res = await client.post('files/mkdir', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options?.headers
    })

    await res.text()
  }

  return mkdir
}

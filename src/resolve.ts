import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { Client } from './lib/core.js'
import type { ResolveOptions } from './root.js'

export function createResolve (client: Client) {
  async function resolve (path: string, options?: ResolveOptions): Promise<string> {
    const res = await client.post('resolve', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options?.headers
    })
    const { Path } = await res.json()
    return Path
  }

  return resolve
}

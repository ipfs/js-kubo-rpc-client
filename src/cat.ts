import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { Client } from './lib/core.js'
import type { CatOptions } from './root.js'
import type { IPFSPath } from './index.js'

export function createCat (client: Client) {
  async function * cat (path: IPFSPath, options?: CatOptions): AsyncIterable<Uint8Array> {
    const res = await client.post('cat', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: path.toString(),
        ...options
      }),
      headers: options?.headers
    })

    yield * res.iterator()
  }

  return cat
}

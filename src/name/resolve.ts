import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { NameAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createResolve (client: HTTPRPCClient): NameAPI['resolve'] {
  return async function * resolve (path, options = {}) {
    const res = await client.post('name/resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        stream: true,
        ...options
      }),
      headers: options.headers
    })

    for await (const result of res.ndjson()) {
      yield result.Path
    }
  }
}

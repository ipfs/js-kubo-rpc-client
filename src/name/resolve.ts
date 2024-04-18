import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { NameAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

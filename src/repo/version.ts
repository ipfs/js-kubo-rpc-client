import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { RepoAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createVersion (client: HTTPRPCClient): RepoAPI['version'] {
  return async function version (options = {}) {
    const res = await (await client.post('repo/version', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return res.Version
  }
}

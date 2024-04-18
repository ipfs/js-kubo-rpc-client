import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { RepoAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

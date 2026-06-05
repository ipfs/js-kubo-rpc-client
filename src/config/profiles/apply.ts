import { toUrlSearchParams } from '../../lib/to-url-search-params.ts'
import type { ConfigProfilesAPI } from './index.ts'
import type { HTTPRPCClient } from '../../lib/core.ts'

export function createApply (client: HTTPRPCClient): ConfigProfilesAPI['apply'] {
  return async function apply (profile, options = {}) {
    const res = await client.post('config/profile/apply', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: profile,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return {
      original: data.OldCfg, updated: data.NewCfg
    }
  }
}

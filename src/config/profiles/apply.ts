import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { Client } from '../../lib/core.js'
import type { ProfilesApplyOptions, ProfilesApplyResult } from './index.js'

export function createApply (client: Client) {
  async function apply (profile: string, options?: ProfilesApplyOptions): Promise<ProfilesApplyResult> {
    const res = await client.post('config/profile/apply', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: profile,
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    return {
      original: data.OldCfg, updated: data.NewCfg
    }
  }

  return apply
}

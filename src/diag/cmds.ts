import type { Client } from '../lib/core.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ClientOptions } from '../index.js'
import type { CmdsResult } from './index.js'

export function createCmds (client: Client) {
  async function cmds (options?: ClientOptions): Promise<CmdsResult[]> {
    const res = await client.post('diag/cmds', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    return await res.json()
  }
  return cmds
}

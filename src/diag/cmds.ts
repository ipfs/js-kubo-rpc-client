import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { DiagAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createCmds (client: HTTPRPCClient): DiagAPI['cmds'] {
  return async function cmds (options = {}) {
    const res = await client.post('diag/cmds', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return res.json()
  }
}

import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { DiagAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

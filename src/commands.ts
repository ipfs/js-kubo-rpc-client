import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { KuboRPCClient } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

export function createCommands (client: HTTPRPCClient): KuboRPCClient['commands'] {
  return async function commands (options = {}) {
    const res = await client.post('commands', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return res.json()
  }
}

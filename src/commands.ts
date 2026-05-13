import { toUrlSearchParams } from './lib/to-url-search-params.ts'
import type { KuboRPCClient } from './index.ts'
import type { HTTPRPCClient } from './lib/core.ts'

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

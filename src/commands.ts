import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { Client } from './lib/core.js'
import type { ClientOptions } from './index.js'

export function createCommands (client: Client) {
  const commands = async (options?: ClientOptions): Promise<string[]> => {
    const res = await client.post('commands', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })

    const data: string[] = await res.json()
    return data
  }

  return commands
}

import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { rpcArrayToTextArray } from '../lib/http-rpc-wire-format.js'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'

export function createLs (client: Client) {
  async function ls (options?: ClientOptions): Promise<string[]> {
    const { Strings } = await (await client.post('pubsub/ls', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers
    })).json()

    return rpcArrayToTextArray(Strings) ?? []
  }

  return ls
}

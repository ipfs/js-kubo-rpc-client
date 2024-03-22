import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'
import type { Client } from '../../../lib/core.js'
import type { ClientOptions } from '../../../index.js'

export function createRm (client: Client) {
  async function rm (name: string, options?: ClientOptions) {
    await client.post('pin/remote/service/rm', {
      signal: options?.signal,
      headers: options?.headers,
      searchParams: toUrlSearchParams({
        arg: name
      })
    })
  }

  return rm
}

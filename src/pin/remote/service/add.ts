import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'
import { encodeEndpoint } from './utils.js'
import type { ClientOptions } from '../../../index.js'
import type { Client } from '../../../lib/core.js'
import type { Credentials } from './index.js'

export function createAdd (client: Client) {
  async function add (name: string, options: Credentials & ClientOptions): Promise<void> {
    const { endpoint, key, headers, timeout, signal } = options

    await client.post('pin/remote/service/add', {
      timeout,
      signal,
      searchParams: toUrlSearchParams({
        arg: [name, encodeEndpoint(endpoint), key]
      }),
      headers
    })
  }

  return add
}

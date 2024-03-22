import { encodeQuery } from './utils.js'
import type { Client } from '../../lib/core.js'
import type { ClientOptions } from '../../index.js'
import type { Query } from './index.js'

export function createRm (client: Client) {
  async function rm ({ timeout, signal, headers, ...query }: Query & ClientOptions): Promise<void> {
    await client.post('pin/remote/rm', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery({
        ...query,
        all: false
      })
    })
  }

  return rm
}

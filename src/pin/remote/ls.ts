import { encodeQuery, decodePin } from './utils.js'
import type { Client } from '../../lib/core.js'
import type { ClientOptions } from '../../index.js'
import type { Pin, Query } from './index.js'

export function createLs (client: Client) {
  async function * ls ({ timeout, signal, headers, ...query }: Query & ClientOptions): AsyncIterable<Pin> {
    const response = await client.post('pin/remote/ls', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery(query)
    })

    for await (const pin of response.ndjson()) {
      yield decodePin(pin)
    }
  }

  return ls
}

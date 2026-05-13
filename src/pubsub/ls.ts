import { rpcArrayToTextArray } from '../lib/http-rpc-wire-format.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { PubSubAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createLs (client: HTTPRPCClient): PubSubAPI['ls'] {
  return async function ls (options = {}) {
    const { Strings } = await (await client.post('pubsub/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return rpcArrayToTextArray(Strings) ?? []
  }
}

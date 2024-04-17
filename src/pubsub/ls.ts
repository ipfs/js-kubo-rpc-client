import { rpcArrayToTextArray } from '../lib/http-rpc-wire-format.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PubSubAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

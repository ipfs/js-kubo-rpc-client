import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'
import { decodeRemoteService } from './utils.js'
import type { Client } from '../../../lib/core.js'
import type { ClientOptions } from '../../../index.js'
import type { RemotePinService, RemotePinServiceWithStat } from './index.js'

export function createLs (client: Client) {
  async function ls (options: { stat?: true } & ClientOptions): Promise<RemotePinServiceWithStat | RemotePinService[]> {
    const { stat, headers, timeout, signal } = options

    const response = await client.post('pin/remote/service/ls', {
      timeout,
      signal,
      headers,
      searchParams: stat === true ? toUrlSearchParams({ stat }) : undefined
    })

    const { RemoteServices } = await response.json()

    return RemoteServices.map(decodeRemoteService)
  }

  return ls
}

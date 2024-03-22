import { encodeAddParams, decodePin } from './utils.js'
import type { CID } from 'multiformats'
import type { Client } from '../../lib/core.js'
import type { ClientOptions } from '../../index.js'
import type { AddOptions, Pin } from './index.js'

export function createAdd (client: Client) {
  async function add (cid: CID, options: AddOptions & ClientOptions): Promise<Pin> {
    const { timeout, signal, headers, ...query } = options ?? {}
    const response = await client.post('pin/remote/add', {
      timeout: options?.timeout,
      signal: options?.signal,
      headers: options?.headers,
      searchParams: encodeAddParams({ cid, ...query })
    })

    return decodePin(await response.json())
  }

  return add
}

import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { NewObjectOptions } from './index.js'

export function createNew (client: Client) {
  async function newObject (options?: NewObjectOptions): Promise<CID> {
    const res = await client.post('object/new', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: options?.template,
        ...options
      }),
      headers: options?.headers
    })

    const { Hash } = await res.json()

    return CID.parse(Hash)
  }

  return newObject
}

import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { PBLink } from '@ipld/dag-pb'
import type { Client } from '../../lib/core.js'
import type { ClientOptions } from '../../index.js'

export function createRmLink (client: Client) {
  async function rmLink (cid: CID, link: PBLink | string, options?: ClientOptions): Promise<CID> {
    const res = await client.post('object/patch/rm-link', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: [
          cid.toString(),
          // @ts-expect-error loose types
          dLink.Name ?? dLink.name ?? null
        ],
        ...options
      }),
      headers: options?.headers
    })

    const { Hash } = await res.json()
    return CID.parse(Hash)
  }

  return rmLink
}

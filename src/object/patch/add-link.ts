import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { PBLink } from '@ipld/dag-pb'
import type { ClientOptions } from '../../index.js'
import type { Client } from '../../lib/core.js'

export function createAddLink (client: Client) {
  async function addLink (cid: CID, link: PBLink, options?: ClientOptions): Promise<CID> {
    const res = await client.post('object/patch/add-link', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: [
          cid.toString(),
          // @ts-expect-error loose types
          dLink.Name ?? dLink.name ?? '',
          // @ts-expect-error loose types
          (dLink.Hash ?? dLink.cid ?? '').toString() ?? null
        ],
        ...options
      }),
      headers: options?.headers
    })

    const { Hash } = await res.json()
    return CID.parse(Hash)
  }

  return addLink
}

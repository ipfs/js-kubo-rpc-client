import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PBLink } from '@ipld/dag-pb'
import type { Client } from '../lib/core.js'
import type { ClientOptions, PreloadOptions } from '../index.js'

export function createLinks (client: Client) {
  async function links (cid: CID, options?: ClientOptions & PreloadOptions): Promise<PBLink[]> {
    const res = await client.post('object/links', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: (cid instanceof Uint8Array ? CID.decode(cid) : cid).toString(),
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    return (data.Links ?? []).map((link: any) => ({
      Name: link.Name,
      Tsize: link.Size,
      Hash: CID.parse(link.Hash)
    }))
  }

  return links
}

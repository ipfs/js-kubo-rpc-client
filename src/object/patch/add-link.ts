import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { ObjectPatchAPI } from './index.js'
import type { HTTPRPCClient } from '../../lib/core.js'

export function createAddLink (client: HTTPRPCClient): ObjectPatchAPI['addLink'] {
  return async function addLink (cid, dLink, options = {}) {
    const res = await client.post('object/patch/add-link', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          `${cid}`,
          // @ts-expect-error loose types
          dLink.Name ?? dLink.name ?? '',
          // @ts-expect-error loose types
          (dLink.Hash ?? dLink.cid ?? '').toString() ?? null
        ],
        ...options
      }),
      headers: options.headers
    })

    const { Hash } = await res.json()

    return CID.parse(Hash)
  }
}

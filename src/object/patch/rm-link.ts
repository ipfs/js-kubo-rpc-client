import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'
import type { ObjectPatchAPI } from './index.js'
import type { HTTPRPCClient } from '../../lib/core.js'

export function createRmLink (client: HTTPRPCClient): ObjectPatchAPI['rmLink'] {
  return async function rmLink (cid, dLink, options = {}) {
    const res = await client.post('object/patch/rm-link', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          `${cid}`,
          // @ts-expect-error loose types
          dLink.Name ?? dLink.name ?? null
        ],
        ...options
      }),
      headers: options.headers
    })

    const { Hash } = await res.json()

    return CID.parse(Hash)
  }
}

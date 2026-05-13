import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { FilesAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createCp (client: HTTPRPCClient): FilesAPI['cp'] {
  return async function cp (sources, destination, options = {}) {
    /** @type {import('../types').IPFSPath[]} */
    const sourceArr = Array.isArray(sources) ? sources : [sources]

    const res = await client.post('files/cp', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sourceArr.concat(destination).map(src => (CID.asCID(src) != null) ? `/ipfs/${src}` : src),
        ...options
      }),
      headers: options.headers
    })

    await res.text()
  }
}

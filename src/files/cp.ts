import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { IPFSPath } from '../index.js'
import type { CpOptions } from './index.js'

export function createCp (client: Client) {
  async function cp (sources: IPFSPath | IPFSPath[], destination: string, options?: CpOptions): Promise<void> {
    const sourceArr: IPFSPath[] = Array.isArray(sources) ? sources : [sources]

    const res = await client.post('files/cp', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: sourceArr.concat(destination).map(src => CID.asCID(src) != null ? `/ipfs/${src.toString()}` : src),
        ...options
      }),
      headers: options?.headers
    })

    await res.text()
  }

  return cp
}

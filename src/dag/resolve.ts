import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { IPFSPath } from '../index.js'
import type { ResolveOptions, ResolveResult } from './index.js'

export function createResolve (client: Client) {
  const resolve = async (ipfsPath: IPFSPath, options?: ResolveOptions): Promise<ResolveResult> => {
    const res = await client.post('dag/resolve', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: `${ipfsPath.toString()}${options?.path != null ? `/${options.path}`.replace(/\/[/]+/g, '/') : ''}`,
        ...options
      }),
      headers: options?.headers
    })

    const data = await res.json()

    return { cid: CID.parse(data.Cid['/']), remainderPath: data.RemPath }
  }

  return resolve
}

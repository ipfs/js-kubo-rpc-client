import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { DAGAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createResolve (client: HTTPRPCClient): DAGAPI['resolve'] {
  return async function resolve (ipfsPath, options = {}) {
    const res = await client.post('dag/resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${ipfsPath}${options.path != null ? `/${options.path}`.replace(/\/[/]+/g, '/') : ''}`,
        ...options
      }),
      headers: options.headers
    })

    const data = await res.json()

    return { cid: CID.parse(data.Cid['/']), remainderPath: data.RemPath }
  }
}

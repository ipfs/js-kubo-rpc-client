import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { RepoAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createGc (client: HTTPRPCClient): RepoAPI['gc'] {
  return async function * gc (options = {}) {
    const res = await client.post('repo/gc', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers,
      transform: (res: any) => {
        return {
          err: res.Error != null ? new Error(res.Error) : null,
          cid: res.Key?.['/'] != null ? CID.parse(res.Key['/']) : null
        }
      }
    })

    yield * res.ndjson()
  }
}

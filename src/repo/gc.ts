import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { GCOptions, GCResult } from './index.js'

export function createGc (client: Client) {
  async function * gc (options?: GCOptions): AsyncIterable<GCResult> {
    const res = await client.post('repo/gc', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers,
      transform: (res) => {
        return {
          err: res.Error != null ? new Error(res.Error) : null,
          cid: res?.Key?.['/'] != null ? CID.parse(res.Key['/']) : null
        }
      }
    })

    yield * res.ndjson()
  }

  return gc
}

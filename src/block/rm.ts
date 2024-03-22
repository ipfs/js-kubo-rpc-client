import { CID } from 'multiformats/cid'
import type { Client } from '../lib/core.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { RmOptions, RmResult } from './index.js'

export function createRm (client: Client) {
  async function * rm (cid: CID | CID[], options?: RmOptions): AsyncIterable<RmResult> {
    if (!Array.isArray(cid)) {
      cid = [cid]
    }

    const res = await client.post('block/rm', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: cid.map(cid => cid.toString()),
        'stream-channels': true,
        ...options
      }),
      headers: options?.headers
    })

    for await (const removed of res.ndjson()) {
      yield toCoreInterface(removed)
    }
  }

  return rm
}

function toCoreInterface (removed: Record<string, string>): RmResult {
  const out: RmResult = {
    cid: CID.parse(removed.Hash)
  }

  if (removed.Error != null) {
    out.error = new Error(removed.Error)
  }

  return out
}

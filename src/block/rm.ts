import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { BlockRmResult, BlockAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createRm (client: HTTPRPCClient): BlockAPI['rm'] {
  return async function * rm (cid, options = {}) {
    if (!Array.isArray(cid)) {
      cid = [cid]
    }

    const res = await client.post('block/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.map(cid => cid.toString()),
        'stream-channels': true,
        ...options
      }),
      headers: options.headers
    })

    for await (const removed of res.ndjson()) {
      yield toCoreInterface(removed)
    }
  }
}

function toCoreInterface (removed: any): BlockRmResult {
  const out: BlockRmResult = {
    cid: CID.parse(removed.Hash)
  }

  if (removed.Error != null) {
    out.error = new Error(removed.Error)
  }

  return out
}

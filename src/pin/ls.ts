import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PinAPI, PinLsResult } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

function toPin (type: string, cid: string, metadata: Record<string, string>): PinLsResult {
  const pin: PinLsResult = {
    type,
    cid: CID.parse(cid)
  }

  if (metadata != null) {
    pin.metadata = metadata
  }

  return pin
}

export function createLs (client: HTTPRPCClient): PinAPI['ls'] {
  return async function * ls (options = {}) {
    let paths: any[] = []

    if (options.paths != null) {
      paths = Array.isArray(options.paths) ? options.paths : [options.paths]
    }

    const res = await client.post('pin/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        arg: paths.map(path => `${path}`),
        stream: true
      }),
      headers: options.headers
    })

    for await (const pin of res.ndjson()) {
      if (pin.Keys != null) { // non-streaming response
        for (const cid of Object.keys(pin.Keys)) {
          yield toPin(pin.Keys[cid].Type, cid, pin.Keys[cid].Metadata)
        }
        return
      }

      yield toPin(pin.Type, pin.Cid, pin.Metadata)
    }
  }
}

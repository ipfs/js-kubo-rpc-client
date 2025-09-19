import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PinAPI, PinLsResult } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

function toPin (type: string, cid: string, metadata: Record<string, string>, name: string): PinLsResult {
  const pin: PinLsResult = {
    type,
    cid: CID.parse(cid)
  }

  if (metadata != null) {
    pin.metadata = metadata
  }
  if (name != null) {
    pin.name = name
  }

  return pin
}

export function createLs (client: HTTPRPCClient): PinAPI['ls'] {
  return async function * ls (options = {}) {
    let paths: any[] = []

    if (options.paths != null) {
      paths = Array.isArray(options.paths) ? options.paths : [options.paths]
    }

    // Check for conflicting options
    if (options.name != null && options.names === false) {
      throw new Error('Cannot use name filter when names is explicitly set to false')
    }

    // Check for empty name filter
    if (options.name === '') {
      throw new Error('Name filter cannot be empty string')
    }

    // If name filter is provided, automatically enable names flag
    const names = options.names ?? (options.name != null)

    const res = await client.post('pin/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        arg: paths.map(path => `${path}`),
        names,
        stream: true
      }),
      headers: options.headers
    })

    for await (const pin of res.ndjson()) {
      if (pin.Keys != null) { // non-streaming response
        for (const cid of Object.keys(pin.Keys)) {
          yield toPin(pin.Keys[cid].Type, cid, pin.Keys[cid].Metadata, pin.Keys[cid].Name)
        }
        return
      }

      yield toPin(pin.Type, pin.Cid, pin.Metadata, pin.Name)
    }
  }
}

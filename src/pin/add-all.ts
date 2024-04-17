import { CID } from 'multiformats/cid'
import { normaliseInput } from '../lib/pins/normalise-input.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { PinAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createAddAll (client: HTTPRPCClient): PinAPI['addAll'] {
  return async function * addAll (source, options = {}) {
    for await (const { path, recursive, metadata } of normaliseInput(source)) {
      const res = await client.post('pin/add', {
        signal: options.signal,
        searchParams: toUrlSearchParams({
          ...options,
          arg: path,
          recursive,
          metadata: metadata != null ? JSON.stringify(metadata) : undefined,
          stream: true
        }),
        headers: options.headers
      })

      for await (const pin of res.ndjson()) {
        if (pin.Pins != null) { // non-streaming response
          for (const cid of pin.Pins) {
            yield CID.parse(cid)
          }
          // eslint-disable-next-line no-continue
          continue
        }

        yield CID.parse(pin)
      }
    }
  }
}

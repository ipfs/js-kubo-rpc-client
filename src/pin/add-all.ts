import { CID } from 'multiformats/cid'
import { normaliseInput } from '../lib/pins/normalise-input.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { PinAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createAddAll (client: HTTPRPCClient): PinAPI['addAll'] {
  return async function * addAll (source, options = {}) {
    for await (const { path, recursive, metadata, name } of normaliseInput(source)) {
      const res = await client.post('pin/add', {
        signal: options.signal,
        searchParams: toUrlSearchParams({
          ...options,
          arg: path.toString(),
          recursive,
          metadata: metadata != null ? JSON.stringify(metadata) : undefined,
          name: name ?? options.name,
          stream: true
        }),
        headers: options.headers
      })

      for await (const pin of res.ndjson()) {
        if (pin.Pins != null) { // non-streaming response
          for (const cid of pin.Pins) {
            yield CID.parse(cid)
          }

          continue
        }

        yield CID.parse(pin)
      }
    }
  }
}

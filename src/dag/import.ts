import { anySignal } from 'any-signal'
import { CID } from 'multiformats/cid'
import { multipartRequest } from '../lib/multipart-request.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { DAGAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createImport (client: HTTPRPCClient): DAGAPI['import'] {
  return async function * dagImport (source, options = {}) {
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])

    try {
      const { headers, body } = await multipartRequest(source, controller, options.headers)

      const res = await client.post('dag/import', {
        signal,
        headers,
        body,
        searchParams: toUrlSearchParams({ 'pin-roots': options.pinRoots })
      })

      for await (const { Root } of res.ndjson()) {
        if (Root !== undefined) {
          const { Cid: { '/': Cid }, PinErrorMsg } = Root

          yield {
            root: {
              cid: CID.parse(Cid),
              pinErrorMsg: PinErrorMsg
            }
          }
        }
      }
    } finally {
      signal.clear()
    }
  }
}

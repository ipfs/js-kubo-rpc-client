import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { CID } from 'multiformats/cid'
import type { ImportOptions, ImportResult } from './index.js'
import type { Client } from '../lib/core.js'

export function createImport (client: Client) {
  async function * dagImport (source: Iterable<Uint8Array> | AsyncIterable<Uint8Array> | AsyncIterable<AsyncIterable<Uint8Array>> | Iterable<AsyncIterable<Uint8Array>>, options?: ImportOptions): AsyncIterable<ImportResult> {
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options?.signal)
    const { headers, body } = await multipartRequest(source, controller, options?.headers)

    const res = await client.post('dag/import', {
      signal,
      headers,
      body,
      searchParams: toUrlSearchParams({ 'pin-roots': options?.pinRoots })
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
  }

  return dagImport
}

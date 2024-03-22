import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { CID } from 'multiformats'
import type { ExportOptions } from './index.js'
import type { Client } from '../lib/core.js'

export function createExport (client: Client) {
  async function * dagExport (root: CID, options?: ExportOptions): AsyncIterable<Uint8Array> {
    const res = await client.post('dag/export', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: root.toString()
      }),
      headers: options?.headers
    })

    yield * res.iterator()
  }

  return dagExport
}

import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { DAGAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createExport (client: HTTPRPCClient): DAGAPI['export'] {
  return async function * dagExport (root, options = {}) {
    const res = await client.post('dag/export', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: root.toString()
      }),
      headers: options.headers
    })

    yield * res.iterator()
  }
}

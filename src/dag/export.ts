import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { DAGAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

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

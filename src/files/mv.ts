import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { FilesAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createMv (client: HTTPRPCClient): FilesAPI['mv'] {
  return async function mv (sources, destination, options = {}) {
    if (!Array.isArray(sources)) {
      sources = [sources]
    }

    const res = await client.post('files/mv', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sources.concat(destination),
        ...options
      }),
      headers: options.headers
    })
    await res.text()
  }
}

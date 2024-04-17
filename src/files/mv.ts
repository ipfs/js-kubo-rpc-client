import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { FilesAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

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

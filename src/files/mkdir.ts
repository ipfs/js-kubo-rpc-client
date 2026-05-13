import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { FilesAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createMkdir (client: HTTPRPCClient): FilesAPI['mkdir'] {
  return async function mkdir (path, options = {}) {
    const res = await client.post('files/mkdir', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })

    await res.text()
  }
}

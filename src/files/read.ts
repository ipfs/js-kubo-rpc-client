import { source } from 'stream-to-it'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { FilesAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createRead (client: HTTPRPCClient): FilesAPI['read'] {
  return async function * read (path, options = {}) {
    const res = await client.post('files/read', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        count: options.length,
        ...options
      }),
      headers: options.headers
    })

    if (res.body == null) {
      throw new Error('Invalid response body')
    }

    yield * source(res.body)
  }
}

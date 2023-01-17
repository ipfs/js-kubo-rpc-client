import { toUrlSearchParams } from '../lib/to-url-search-params.js'
// @ts-expect-error no types
import toIterable from 'stream-to-it/source.js'
import type { IPFSPath } from '../index.js'
import type { ReadOptions } from './index.js'
import type { Client } from '../lib/core.js'

export function createRead (client: Client) {
  async function * read (path: IPFSPath, options?: ReadOptions): AsyncIterable<Uint8Array> {
    const res = await client.post('files/read', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        count: options?.length,
        ...options
      }),
      headers: options?.headers
    })

    yield * toIterable(res.body)
  }

  return read
}

import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import HTTP from 'ipfs-utils/src/http.js'
import type { Client } from '../lib/core.js'
import type { RmOptions } from './index.js'

export function createRm (client: Client) {
  async function rm (path: string | string[], options?: RmOptions): Promise<void> {
    const res = await client.post('files/rm', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options?.headers
    })

    const body = await res.text()
    // we don't expect text body to be ever present
    // (if so, it means an error such as https://github.com/ipfs/go-ipfs/issues/8606)
    if (body !== '') {
      const error: Error = new HTTP.HTTPError(res)
      error.message = body
      throw error
    }
  }

  return rm
}

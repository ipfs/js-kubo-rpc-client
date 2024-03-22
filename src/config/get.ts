import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'

export function createGet (client: Client) {
  const get = async (key: string, options?: ClientOptions): Promise<string | object> => {
    if (key == null) {
      throw new Error('key argument is required')
    }

    const res = await client.post('config', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: key,
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()
    return data.Value
  }

  return get
}

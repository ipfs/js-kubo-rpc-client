import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ClientOptions } from '../index.js'
import type { Config } from './index.js'
import type { Client } from '../lib/core.js'

export function createGetAll (client: Client) {
  const getAll = async (options?: ClientOptions): Promise<Config> => {
    const res = await client.post('config/show', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    return data
  }

  return getAll
}

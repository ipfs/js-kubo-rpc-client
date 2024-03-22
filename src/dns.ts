import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { Client } from './lib/core.js'
import type { DNSOptions } from './root.js'

export function createDns (client: Client) {
  const dns = async (domain: string, options?: DNSOptions): Promise<string> => {
    const res = await client.post('dns', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: domain,
        ...options
      }),
      headers: options?.headers
    })
    const data = await res.json()

    return data.Path
  }

  return dns
}

import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { BWOptions, BWResult } from './index.js'

export function createBw (client: Client) {
  async function * bw (options?: BWOptions): AsyncIterable<BWResult> {
    const res = await client.post('stats/bw', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(options),
      headers: options?.headers,
      transform: (stats) => ({
        totalIn: BigInt(stats.TotalIn),
        totalOut: BigInt(stats.TotalOut),
        rateIn: parseFloat(stats.RateIn),
        rateOut: parseFloat(stats.RateOut)
      })
    })

    yield * res.ndjson()
  }
  return bw
}

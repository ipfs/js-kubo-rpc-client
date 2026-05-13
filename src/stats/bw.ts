import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { StatsAPI } from './index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createBw (client: HTTPRPCClient): StatsAPI['bw'] {
  return async function * bw (options = {}) {
    const res = await client.post('stats/bw', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers,
      transform: (stats: any) => ({
        totalIn: BigInt(stats.TotalIn),
        totalOut: BigInt(stats.TotalOut),
        rateIn: parseFloat(stats.RateIn),
        rateOut: parseFloat(stats.RateOut)
      })
    })

    yield * res.ndjson()
  }
}

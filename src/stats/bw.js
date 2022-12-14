import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createBw = configure(api => {
  /**
   * @type {import('../types').StatsAPI["bw"]}
   */
  async function * bw (options = {}) {
    const res = await api.post('stats/bw', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers,
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
})

import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createExport = configure(api => {
  /**
   * @type {import('../types').DAGAPI["export"]}
   */
  async function * dagExport (root, options = {}) {
    const res = await api.post('dag/export', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: root.toString()
      }),
      headers: options.headers
    })

    yield * res.iterator()
  }

  return dagExport
})

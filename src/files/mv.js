import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

export const createMv = configure(api => {
  /**
   * @type {import('../types').FilesAPI["mv"]}
   */
  async function mv (sources, destination, options = {}) {
    if (!Array.isArray(sources)) {
      sources = [sources]
    }

    const res = await api.post('files/mv', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sources.concat(destination),
        ...options
      }),
      headers: options.headers
    })
    await res.text()
  }

  return mv
})

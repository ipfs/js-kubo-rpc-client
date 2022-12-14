import { configure } from '../../lib/configure.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'

export const createSubs = configure(api => {
  /**
   * @type {import('../../types').NamePubsubAPI["subs"]}
   */
  async function subs (options = {}) {
    const res = await api.post('name/pubsub/subs', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const data = await res.json()

    return data.Strings || []
  }
  return subs
})

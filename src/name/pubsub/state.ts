import { objectToCamel } from '../../lib/object-to-camel.js'
import { configure } from '../../lib/configure.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'

export const createState = configure(api => {
  /**
   * @type {import('../../types').NamePubsubAPI["state"]}
   */
  async function state (options = {}) {
    const res = await api.post('name/pubsub/state', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    // @ts-expect-error server output is not typed
    return objectToCamel(await res.json())
  }
  return state
})

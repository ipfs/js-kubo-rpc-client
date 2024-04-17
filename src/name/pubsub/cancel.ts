import { objectToCamel } from '../../lib/object-to-camel.js'
import { configure } from '../../lib/configure.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'

/**
 * @param {import('../../types').Options} config
 * @returns {import('../../types').NamePubsubAPI["cancel"]}
 */
export const createCancel = configure(api => {
  /**
   * @type {import('../../types').NamePubsubAPI["cancel"]}
   */
  async function cancel (name, options = {}) {
    const res = await api.post('name/pubsub/cancel', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    })

    // @ts-expect-error server output is not typed
    return objectToCamel(await res.json())
  }
  return cancel
})

import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @param {import('../types').Options} config
 * @returns {import('../types').IPFS<import('../types').HTTPClientExtraOptions>['publish']}
 */
export const createPublish = configure(api => {
  /**
   * @type {import('../types.js').NameAPI["publish"]}
   */
  async function publish (path, options = {}) {
    const res = await api.post('name/publish', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${path}`,
        ...options
      }),
      headers: options.headers
    })

    // @ts-expect-error server output is not typed
    return objectToCamel(await res.json())
  }
  return publish
})

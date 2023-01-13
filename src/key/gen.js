import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/** @type {import('ipfs-core-types/src/key').GenOptions} */
const defaultOptions = {
  type: 'Ed25519'
}

export const createGen = configure(api => {
  /**
   * @type {import('../types').KeyAPI["gen"]}
   */
  async function gen (name, options = defaultOptions) {
    const res = await api.post('key/gen', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    // @ts-expect-error server output is not typed
    return objectToCamel(data)
  }
  return gen
})

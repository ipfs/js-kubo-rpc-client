import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { rpcArrayToTextArray } from '../lib/http-rpc-wire-format.js'

export const createLs = configure(api => {
  /**
   * @type {import('../types').PubsubAPI["ls"]}
   */
  async function ls (options = {}) {
    const { Strings } = await (await api.post('pubsub/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return rpcArrayToTextArray(Strings) || []
  }
  return ls
})
